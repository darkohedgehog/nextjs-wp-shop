<?php
defined('ABSPATH') || exit;

final class Zivic_Price_List_Admin {
    private const FIELDS = [
        'anchor_amount' => 'Sidrena cijena s PDV-om (EUR)', 'anchor_date' => 'Referentni datum (GGGG-MM-DD)',
        'brand' => 'Marka (ako nije u taksonomiji)', 'barcode' => 'Barkod (ako nije u WooCommerce GTIN polju)',
        'unit' => 'Jedinica mjere (prazno ako nije primjenjivo)', 'unit_quantity' => 'Količina u jedinici mjere za prodajno pakiranje',
        'promotion' => 'Naziv posebnog oblika prodaje (kada je akcija aktivna)',
    ];

    public static function register(): void {
        add_action('admin_menu', static function () {
            add_submenu_page('woocommerce', 'Cjenici webshopa', 'Cjenici webshopa', 'manage_woocommerce', 'zpl-price-lists', [self::class, 'page']);
        });
        add_action('admin_post_zpl_settings', [self::class, 'save_settings']);
        add_action('admin_post_zpl_generate', [self::class, 'generate']);
        add_action('woocommerce_product_options_general_product_data', static function () {
            global $product_object;
            if ($product_object) self::fields($product_object, false);
        });
        add_action('woocommerce_variation_options_pricing', static function ($loop, $data, $variation) {
            $product = wc_get_product($variation->ID);
            if ($product) self::fields($product, true);
        }, 10, 3);
        add_action('woocommerce_admin_process_product_object', static function ($product) {
            if (!current_user_can('edit_post', $product->get_id())) return;
            if (!isset($_POST['woocommerce_meta_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['woocommerce_meta_nonce'])), 'woocommerce_save_data')) return;
            self::save_product($product);
        });
        add_action('woocommerce_save_product_variation', static function ($id) {
            if (!current_user_can('edit_post', $id)) return;
            $nonce = isset($_POST['security']) ? sanitize_text_field(wp_unslash($_POST['security'])) : '';
            if (!wp_verify_nonce($nonce, 'save-variations')) return;
            $product = wc_get_product($id);
            if ($product && self::save_product($product)) $product->save();
        });
    }

    private static function fields($product, bool $variation): void {
        $id = $product->get_id();
        $prefix = 'zpl_product[' . $id . ']';
        echo '<div class="options_group"><p><strong>Sidrena cijena i CSV cjenik</strong></p>';
        woocommerce_wp_select(['id' => 'zpl_status_' . $id, 'name' => $prefix . '[anchor_status]', 'label' => 'Status sidrene cijene',
            'value' => $product->get_meta('_zpl_anchor_status', true, 'edit') ?: 'unknown',
            'options' => ['unknown' => 'Podatak nije provjeren', 'recorded' => 'Potvrđena povijesna cijena', 'not_offered' => 'Nije bio u ponudi na referentni datum'],
            'wrapper_class' => $variation ? 'form-row form-row-full' : '']);
        foreach (self::FIELDS as $key => $label) {
            $value = $product->get_meta('_zpl_' . $key, true, 'edit');
            if ($key === 'anchor_date' && $value === '') $value = '2026-09-10';
            woocommerce_wp_text_input(['id' => 'zpl_' . $key . '_' . $id, 'name' => $prefix . '[' . $key . ']',
                'label' => $label, 'value' => $value, 'wrapper_class' => $variation ? 'form-row form-row-full' : '']);
        }
        echo '<p>Sidrena cijena se unosi iz povijesnih podataka. Spremanje redovne ili akcijske cijene ne mijenja ovaj iznos.</p></div>';
    }

    private static function save_product($product): bool {
        $id = $product->get_id();
        if (!isset($_POST['zpl_product'][$id]) || !is_array($_POST['zpl_product'][$id])) return false;
        $input = wp_unslash($_POST['zpl_product'][$id]);
        $values = [];
        foreach (array_merge(['anchor_status'], array_keys(self::FIELDS)) as $key) {
            if (isset($input[$key]) && !is_scalar($input[$key])) return false;
            $values[$key] = sanitize_text_field($input[$key] ?? '');
        }
        try {
            $anchor = Zivic_Price_List_Domain::anchor($values['anchor_status'], $values['anchor_amount'], $values['anchor_date']);
        } catch (InvalidArgumentException $e) {
            WC_Admin_Meta_Boxes::add_error('Cjenik, ID ' . $id . ': ' . $e->getMessage());
            return false;
        }
        $values['anchor_amount'] = $anchor['amount'] ?? '';
        foreach ($values as $key => $value) $product->update_meta_data('_zpl_' . $key, $value);
        $product->update_meta_data('_zpl_recorded_at', gmdate('c'));
        $product->update_meta_data('_zpl_recorded_by', get_current_user_id());
        return true;
    }

    private static function authorize(string $action): void {
        if (!current_user_can('manage_woocommerce')) wp_die('Nemate ovlasti.', '', ['response' => 403]);
        check_admin_referer($action);
    }

    private static function redirect(): void {
        wp_safe_redirect(admin_url('admin.php?page=zpl-price-lists'));
        exit;
    }

    public static function save_settings(): void {
        self::authorize('zpl_settings');
        $settings = [];
        foreach (['name', 'address', 'code', 'type'] as $key) {
            $raw = $_POST[$key] ?? '';
            $settings[$key] = is_string($raw) ? substr(sanitize_text_field(wp_unslash($raw)), 0, $key === 'code' ? 100 : 300) : '';
        }
        $settings['confirmed'] = isset($_POST['confirmed']);
        $settings['daily'] = isset($_POST['daily']);
        update_option('zpl_settings', $settings, false);
        Zivic_Price_List_Publications::schedule();
        self::redirect();
    }

    public static function generate(): void {
        self::authorize('zpl_generate');
        try {
            Zivic_Price_List_Publications::generate();
            delete_option('zpl_last_error');
        } catch (Throwable $e) { update_option('zpl_last_error', $e->getMessage(), false); }
        self::redirect();
    }

    public static function page(): void {
        if (!current_user_can('manage_woocommerce')) return;
        $settings = Zivic_Price_List_Publications::settings();
        $publications = get_option('zpl_publications', []);
        echo '<div class="wrap"><h1>Cjenici webshopa</h1><p>Javne B2C cijene u EUR s PDV-om. Maloprodaja iz Synesisa nije dio ovog dodatka.</p>';
        $error = get_option('zpl_last_error', '');
        if ($error) echo '<div class="notice notice-error"><p>' . esc_html($error) . '</p></div>';
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '"><input type="hidden" name="action" value="zpl_settings">';
        wp_nonce_field('zpl_settings');
        foreach (['name' => 'Naziv webshopa', 'address' => 'Adresa prodajnog objekta', 'code' => 'Oznaka prodajnog objekta', 'type' => 'Oblik prodajnog objekta'] as $key => $label) {
            echo '<p><label>' . esc_html($label) . '<br><input class="regular-text" required name="' . esc_attr($key) . '" value="' . esc_attr($settings[$key]) . '"></label></p>';
        }
        echo '<p><label><input type="checkbox" name="confirmed" value="1" ' . checked($settings['confirmed'], true, false) . '> Provjerio/la sam javne WooCommerce cijene, porezne postavke, jedinice mjere i podatke proizvoda.</label></p>';
        echo '<p><label><input type="checkbox" name="daily" value="1" ' . checked($settings['daily'], true, false) . '> Omogući dnevnu objavu u 07:00 (Europe/Zagreb).</label></p>';
        echo '<p>Za pravodobnu objavu potreban je serverski raspored koji pokreće WordPress cron. Sam WP-Cron ovisi o posjetama. Arhiva se ne briše automatski.</p>';
        submit_button('Spremi postavke');
        echo '</form><hr><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '"><input type="hidden" name="action" value="zpl_generate">';
        wp_nonce_field('zpl_generate');
        submit_button('Provjeri podatke i objavi novi CSV', 'secondary');
        echo '</form><h2>Objavljeni cjenici</h2><ul>';
        foreach ($publications as $publication) {
            echo '<li><a href="' . esc_url($publication['url']) . '">' . esc_html($publication['filename']) . '</a> — ' . esc_html((string) $publication['productCount']) . ' artikala</li>';
        }
        if (!$publications) echo '<li>Još nema objava.</li>';
        echo '</ul></div>';
    }
}
