<?php
defined('ABSPATH') || exit;

final class Zivic_Price_List_Publications {
    public static function register(): void {
        add_action('rest_api_init', static function () {
            register_rest_route('zivic-price-lists/v1', '/publications', [
                'methods' => 'GET', 'permission_callback' => '__return_true',
                'callback' => static function () {
                    $settings = self::settings();
                    $response = new WP_REST_Response([
                        'version' => 1, 'currency' => 'EUR',
                        'store' => ['name' => $settings['name'], 'address' => $settings['address'], 'code' => $settings['code']],
                        'publications' => array_values(get_option('zpl_publications', [])),
                    ]);
                    $response->header('Cache-Control', 'no-store');
                    return $response;
                },
            ]);
        });
        add_action('zpl_daily_publication', [self::class, 'scheduled']);
    }

    public static function settings(): array {
        return array_merge(['name' => 'Webshop', 'address' => '', 'code' => '', 'type' => 'webshop', 'confirmed' => false, 'daily' => false], get_option('zpl_settings', []));
    }

    /** One-shot rescheduling uses Zagreb wall-clock time, including daylight-saving changes. */
    public static function schedule(): void {
        wp_clear_scheduled_hook('zpl_daily_publication');
        if (!self::settings()['daily']) return;
        $now = new DateTimeImmutable('now', new DateTimeZone('Europe/Zagreb'));
        $next = $now->setTime(7, 0);
        if ($next <= $now) $next = $next->modify('+1 day');
        wp_schedule_single_event($next->getTimestamp(), 'zpl_daily_publication');
    }

    public static function scheduled(): void {
        if (!self::settings()['daily']) return;
        try {
            self::generate();
            delete_option('zpl_last_error');
        } catch (Throwable $e) {
            // Visible only to administrators; never send internal errors through the public endpoint.
            update_option('zpl_last_error', $e->getMessage(), false);
        } finally {
            self::schedule();
        }
    }

    public static function generate(): array {
        $settings = self::settings();
        foreach (['name', 'address', 'code', 'type'] as $key) {
            if (trim($settings[$key]) === '') throw new RuntimeException('Popunite podatke o prodajnom mjestu.');
        }
        if (!$settings['confirmed'] || get_woocommerce_currency() !== 'EUR' || wc_get_base_location()['country'] !== 'HR') {
            throw new RuntimeException('Potvrdite B2C cijene, EUR valutu i hrvatsku poreznu osnovicu prije objave.');
        }
        $uploads = wp_upload_dir();
        if (!empty($uploads['error'])) throw new RuntimeException('Direktorij za datoteke nije dostupan.');
        $directory = $uploads['basedir'] . '/zivic-price-lists';
        if (!wp_mkdir_p($directory)) throw new RuntimeException('Nije moguće pripremiti direktorij cjenika.');
        $lock = fopen($directory . '/.generation.lock', 'c');
        if (!$lock) throw new RuntimeException('Nije moguće zaključati generiranje.');
        if (!flock($lock, LOCK_EX | LOCK_NB)) { fclose($lock); throw new RuntimeException('Generiranje je već u tijeku.'); }
        $temporary = null;
        $stream = null;
        try {
            $publications = get_option('zpl_publications', []);
            if (count($publications) >= 5000) throw new RuntimeException('Arhiva zahtijeva proširenje prije nove objave.');
            $sequence = count($publications) + 1;
            $id = wp_generate_uuid4();
            $now = time();
            $parts = array_map(static fn($key) => substr(sanitize_title($settings[$key]), 0, 40), ['type', 'address', 'code']);
            $filename = implode('_', $parts) . '_' . $sequence . '_' . gmdate('Ymd\THis\Z', $now) . '_' . $id . '.csv';
            $temporary = $directory . '/.' . $id . '.tmp';
            $stream = fopen($temporary, 'xb');
            if (!$stream) throw new RuntimeException('Nije moguće otvoriti novu datoteku.');
            if (fwrite($stream, "\xEF\xBB\xBF") === false) throw new RuntimeException('Zapisivanje nije uspjelo.');
            Zivic_Price_List_Domain::write_csv($stream, Zivic_Price_List_Domain::headers());
            $count = 0;
            foreach (Zivic_Price_List_Catalog::products() as $product) {
                try {
                    $columns = Zivic_Price_List_Domain::columns(Zivic_Price_List_Catalog::row($product, $now));
                } catch (InvalidArgumentException $e) {
                    throw new RuntimeException('Proizvod ID ' . $product->get_id() . ': ' . $e->getMessage());
                }
                Zivic_Price_List_Domain::write_csv($stream, $columns);
                $count++;
            }
            if (!$count) throw new RuntimeException('Nema proizvoda spremnih za objavu.');
            if (!fflush($stream)) throw new RuntimeException('Zapisivanje nije uspjelo.');
            fclose($stream);
            $stream = null;
            if (!rename($temporary, $directory . '/' . $filename)) throw new RuntimeException('Objava datoteke nije uspjela.');
            $temporary = null;
            $publication = ['id' => $id, 'filename' => $filename, 'publishedAt' => gmdate('Y-m-d\TH:i:s\Z', $now),
                'productCount' => $count, 'url' => $uploads['baseurl'] . '/zivic-price-lists/' . $filename];
            array_unshift($publications, $publication);
            if (!update_option('zpl_publications', $publications, false)) {
                throw new RuntimeException('Datoteka je zapisana, ali objava nije evidentirana. Prethodni cjenik ostaje važeći.');
            }
            return $publication;
        } finally {
            if (is_resource($stream)) fclose($stream);
            if ($temporary && file_exists($temporary)) unlink($temporary);
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }
}
