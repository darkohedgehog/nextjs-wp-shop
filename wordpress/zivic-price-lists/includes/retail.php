<?php
defined('ABSPATH') || exit;

/** Manual file publication only: never imports or changes WooCommerce products. */
final class Zivic_Retail_Price_Lists {
    private const SLOTS = ['current' => 'Aktualni cjenik s usporedbom cijena', 'anchor' => 'Cijene na referentni datum'];
    private const MIMES = ['xls' => 'application/vnd.ms-excel', 'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'csv' => 'text/csv'];

    public static function register(): void {
        add_action('admin_menu', static function () {
            add_submenu_page('woocommerce', 'Cjenici maloprodaje', 'Cjenici maloprodaje', 'manage_woocommerce', 'zpl-retail-price-lists', [self::class, 'page']);
        });
        add_action('admin_post_zpl_retail_save', [self::class, 'save']);
        add_action('rest_api_init', static function () {
            register_rest_route('zivic-price-lists/v1', '/retail', [
                'methods' => 'GET', 'permission_callback' => '__return_true',
                'callback' => static function () {
                    $response = rest_ensure_response(self::manifest());
                    $response->header('Cache-Control', 'no-store');
                    return $response;
                },
            ]);
        });
    }

    private static function settings(): array {
        return array_merge(['name' => 'Maloprodaja', 'address' => '', 'files' => []], get_option('zpl_retail', []));
    }

    public static function valid_date(string $value): bool {
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        return $date && $date->format('Y-m-d') === $value;
    }

    /** Resolve only an existing local spreadsheet attachment inside WordPress uploads. */
    public static function attachment(int $id): ?array {
        if (get_post_type($id) !== 'attachment') return null;
        $file = get_attached_file($id);
        $uploads = wp_upload_dir();
        $root = realpath($uploads['basedir']);
        $path = $file ? realpath($file) : false;
        $url = wp_get_attachment_url($id);
        if (!$root || !$path || !is_file($path) || !str_starts_with($path, $root . DIRECTORY_SEPARATOR) ||
            !$url || !str_starts_with($url, rtrim($uploads['baseurl'], '/') . '/')) return null;
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (!isset(self::MIMES[$extension])) return null;
        return ['url' => $url, 'filename' => basename($path), 'format' => $extension];
    }

    public static function manifest(): array {
        $settings = self::settings();
        $files = [];
        foreach (self::SLOTS as $slot => $label) {
            $entry = $settings['files'][$slot] ?? null;
            if (!$entry) continue;
            $attachment = self::attachment((int) $entry['attachmentId']);
            if (!$attachment) continue; // Deleted media must not leave a broken public link.
            $files[] = array_merge($attachment, ['kind' => $slot, 'date' => $entry['date'], 'publishedAt' => $entry['publishedAt']]);
        }
        return ['version' => 1, 'store' => ['name' => $settings['name'], 'address' => $settings['address']], 'files' => $files];
    }

    public static function save(): void {
        if (!current_user_can('manage_woocommerce') || !current_user_can('upload_files')) wp_die('Nemate dopuštenje.', '', ['response' => 403]);
        check_admin_referer('zpl_retail_save');
        try {
            // PHP may discard the entire POST if post_max_size is exceeded (nonce then fails above).
            $next = self::settings();
            foreach (['name', 'address'] as $key) {
                $value = $_POST[$key] ?? '';
                if (!is_string($value)) throw new RuntimeException('Neispravni podaci prodajnog mjesta.');
                $next[$key] = sanitize_text_field(wp_unslash($value));
                if ($next[$key] === '' || strlen($next[$key]) > 300) throw new RuntimeException('Unesite naziv i adresu maloprodaje (do 300 znakova).');
            }
            // Validate all fields before any file upload. Commit both public links together.
            foreach (self::SLOTS as $slot => $label) {
                $upload = $_FILES[$slot] ?? ['error' => UPLOAD_ERR_NO_FILE];
                $remove = isset($_POST['remove_' . $slot]);
                if (!is_array($upload) || !isset($upload['error']) || !is_int($upload['error'])) throw new RuntimeException('Neispravna datoteka.');
                if ($remove && $upload['error'] !== UPLOAD_ERR_NO_FILE) throw new RuntimeException('Odaberite zamjenu ili uklanjanje, ne oboje.');
                if ($upload['error'] !== UPLOAD_ERR_NO_FILE && $upload['error'] !== UPLOAD_ERR_OK) throw new RuntimeException('Prijenos nije uspio. Provjerite veličinu datoteke i pokušajte ponovno.');
                if ($remove) { unset($next['files'][$slot]); continue; }
                if ($upload['error'] === UPLOAD_ERR_NO_FILE && !isset($next['files'][$slot])) continue;
                $date = $_POST[$slot . '_date'] ?? '';
                if (!is_string($date) || !self::valid_date($date)) throw new RuntimeException('Unesite ispravan datum za: ' . $label);
                $next['files'][$slot]['date'] = $date;
                if ($upload['error'] === UPLOAD_ERR_OK) {
                    $name = $upload['name'] ?? '';
                    if (!is_string($name) || !isset(self::MIMES[strtolower(pathinfo($name, PATHINFO_EXTENSION))])) throw new RuntimeException('Dopuštene su samo XLS, XLSX i CSV datoteke.');
                    if (!isset($upload['size']) || !is_int($upload['size']) || $upload['size'] < 1 || $upload['size'] > min(wp_max_upload_size(), 20 * 1024 * 1024)) throw new RuntimeException('Datoteka je prazna ili prevelika (najviše 20 MB i ograničenje poslužitelja).');
                }
            }
            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/media.php';
            require_once ABSPATH . 'wp-admin/includes/image.php';
            foreach (self::SLOTS as $slot => $label) {
                if (($_FILES[$slot]['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) continue;
                $id = media_handle_upload($slot, 0, [], ['test_form' => false, 'mimes' => self::MIMES]);
                if (is_wp_error($id) || !self::attachment((int) $id)) throw new RuntimeException('WordPress nije prihvatio datoteku. Provjerite format i dozvole prijenosa. Prethodna objava ostaje aktivna.');
                $next['files'][$slot]['attachmentId'] = $id;
                $next['files'][$slot]['publishedAt'] = gmdate('Y-m-d\TH:i:s\Z');
            }
            if ($next !== self::settings() && !update_option('zpl_retail', $next, false)) throw new RuntimeException('Objava nije spremljena. Prethodni cjenik ostaje aktivan.');
            delete_option('zpl_retail_error');
            $status = 'saved';
        } catch (Throwable $error) {
            update_option('zpl_retail_error', $error->getMessage(), false);
            $status = 'error';
        }
        wp_safe_redirect(admin_url('admin.php?page=zpl-retail-price-lists&retail=' . $status));
        exit;
    }

    public static function page(): void {
        if (!current_user_can('manage_woocommerce')) return;
        $settings = self::settings();
        echo '<div class="wrap"><h1>Cjenici maloprodaje</h1><p>Ručna objava iz Synesisa. Cijene i artikli webshopa ne mijenjaju se.</p>';
        $error = get_option('zpl_retail_error', '');
        if ($error) echo '<div class="notice notice-error"><p>' . esc_html($error) . '</p></div>';
        elseif (($_GET['retail'] ?? '') === 'saved') echo '<div class="notice notice-success"><p>Cjenici maloprodaje su spremljeni.</p></div>';
        echo '<p>Objavljujete izvorne datoteke za javno preuzimanje. Provjerite njihov sadržaj prije objave. Nova datoteka zamjenjuje link; prethodna ostaje u Medijskoj zbirci. Uklanjanje objave ne briše datoteku niti onemogućuje njezin izravni URL.</p>';
        echo '<form action="' . esc_url(admin_url('admin-post.php')) . '" method="post" enctype="multipart/form-data"><input type="hidden" name="action" value="zpl_retail_save">';
        wp_nonce_field('zpl_retail_save');
        foreach (['name' => 'Naziv maloprodaje', 'address' => 'Adresa maloprodaje'] as $key => $label) {
            echo '<p><label for="zpl-retail-' . esc_attr($key) . '">' . esc_html($label) . '</label><br><input class="regular-text" required maxlength="300" id="zpl-retail-' . esc_attr($key) . '" name="' . esc_attr($key) . '" value="' . esc_attr($settings[$key]) . '"></p>';
        }
        foreach (self::SLOTS as $slot => $label) {
            $entry = $settings['files'][$slot] ?? [];
            $file = empty($entry['attachmentId']) ? null : self::attachment((int) $entry['attachmentId']);
            echo '<hr><h2>' . esc_html($label) . '</h2>';
            if ($file) echo '<p>Objavljeno: <a href="' . esc_url($file['url']) . '">' . esc_html($file['filename']) . '</a></p>';
            elseif ($entry) echo '<p>Prethodna datoteka nedostaje. Učitajte zamjenu ili uklonite objavu.</p>';
            echo '<p><label for="zpl-' . esc_attr($slot) . '-date">' . ($slot === 'current' ? 'Datum aktualnog cjenika' : 'Referentni datum cijena') . '</label><br><input type="date" id="zpl-' . esc_attr($slot) . '-date" name="' . esc_attr($slot) . '_date" value="' . esc_attr($entry['date'] ?? ($slot === 'anchor' ? '2026-09-10' : '')) . '"></p>';
            echo '<p><label for="zpl-' . esc_attr($slot) . '">Nova datoteka (XLS, XLSX ili CSV, do 20 MB)</label><br><input type="file" id="zpl-' . esc_attr($slot) . '" name="' . esc_attr($slot) . '" accept=".xls,.xlsx,.csv"></p>';
            if ($entry) echo '<p><label><input type="checkbox" name="remove_' . esc_attr($slot) . '" value="1"> Ukloni ovu objavu s frontenda</label></p>';
        }
        echo '<p>Ako cijene nisu promijenjene, nije potrebno ponovno učitavati datoteku. Prazno polje za datoteku zadržava prethodnu objavu. Sadržaj tablice se ne preračunava; novi artikli i nedostajuće povijesne cijene ostaju točno kako su izvezeni iz Synesisa.</p>';
        submit_button('Spremi i objavi maloprodajne cjenike');
        echo '</form></div>';
    }
}
