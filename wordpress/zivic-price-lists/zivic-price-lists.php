<?php
/**
 * Plugin Name: Živić Webshop Cjenici
 * Description: Sidrene cijene i CSV cjenici webshopa te ručna objava cjenika maloprodaje.
 * Version: 0.2.0
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Requires Plugins: woocommerce
 * Text Domain: zivic-price-lists
 */
defined('ABSPATH') || exit;

require_once __DIR__ . '/includes/domain.php';
require_once __DIR__ . '/includes/catalog.php';
require_once __DIR__ . '/includes/publications.php';
require_once __DIR__ . '/includes/admin.php';
require_once __DIR__ . '/includes/retail.php';

add_action('plugins_loaded', static function () {
    if (!class_exists('WooCommerce')) return;
    Zivic_Price_List_Admin::register();
    Zivic_Price_List_Publications::register();
    Zivic_Retail_Price_Lists::register();
    add_filter('woocommerce_rest_prepare_product_object', ['Zivic_Price_List_Catalog', 'rest_anchor'], 10, 2);
    add_filter('woocommerce_rest_prepare_product_variation_object', ['Zivic_Price_List_Catalog', 'rest_anchor'], 10, 2);
});

// Activation never creates historical values, publishes files, or enables scheduling.
register_deactivation_hook(__FILE__, static function () {
    wp_clear_scheduled_hook('zpl_daily_publication');
});
