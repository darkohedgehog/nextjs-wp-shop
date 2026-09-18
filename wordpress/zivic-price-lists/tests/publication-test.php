<?php
declare(strict_types=1);

// Standalone contract harness: real catalog/export code, temporary files, no WordPress database.
define('ABSPATH', __DIR__);
require_once __DIR__ . '/../includes/domain.php';
require_once __DIR__ . '/../includes/catalog.php';
require_once __DIR__ . '/../includes/publications.php';

$root = sys_get_temp_dir() . '/zpl-test-' . bin2hex(random_bytes(6));
mkdir($root);
$options = ['zpl_settings' => ['name' => 'Webshop', 'address' => 'Zagreb 1', 'code' => 'web', 'type' => 'webshop', 'confirmed' => true], 'woocommerce_prices_include_tax' => 'no'];
$products = [];
$fail_manifest = false;

function get_option($key, $default = false) { return $GLOBALS['options'][$key] ?? $default; }
function update_option($key, $value, $autoload = null) {
    if ($key === 'zpl_publications' && $GLOBALS['fail_manifest']) return false;
    $GLOBALS['options'][$key] = $value; return true;
}
function get_woocommerce_currency() { return 'EUR'; }
function wc_get_base_location() { return ['country' => 'HR']; }
function wp_upload_dir() { return ['basedir' => $GLOBALS['root'], 'baseurl' => 'https://wp.example.com/wp-content/uploads', 'error' => false]; }
function wp_mkdir_p($dir) { return is_dir($dir) || mkdir($dir, 0777, true); }
function wp_generate_uuid4() { return bin2hex(random_bytes(16)); }
function sanitize_title($value) { return strtolower(str_replace(' ', '-', $value)); }
function wc_get_products($args) { return $args['page'] === 1 ? $GLOBALS['products'] : []; }
function get_post_field($field, $id) { return ''; }
function wc_tax_enabled() { return true; }
function wp_strip_all_tags($value) { return strip_tags($value); }
function taxonomy_exists($value) { return false; }
class WC_Tax {
    public static function get_base_tax_rates($class) { return [25]; }
    public static function calc_tax($price, $rates, $inclusive) { return [$price * 0.25]; }
}
class FixtureProduct {
    public array $meta = ['_zpl_anchor_status' => 'recorded', '_zpl_anchor_amount' => '12.50', '_zpl_anchor_date' => '2026-09-10', '_zpl_brand' => 'Brand', '_zpl_barcode' => '000123', '_zpl_unit' => 'm', '_zpl_unit_quantity' => '2'];
    public function get_id() { return 123; }
    public function get_parent_id() { return 0; }
    public function get_name() { return 'Cable'; }
    public function get_sku($context) { return '00123'; }
    public function get_regular_price($context) { if ($context !== 'edit') throw new RuntimeException('B2B filter could affect export'); return '10'; }
    public function get_sale_price($context) { return ''; }
    public function get_date_on_sale_from($context) { return null; }
    public function get_date_on_sale_to($context) { return null; }
    public function get_meta($key, $single, $context) { return $this->meta[$key] ?? ''; }
    public function get_tax_status($context) { return 'taxable'; }
    public function get_tax_class($context) { return ''; }
    public function get_stock_status($context) { return 'instock'; }
    public function get_catalog_visibility($context) { return 'visible'; }
    public function is_type($type) { return $type === 'simple'; }
}
function check_publication(bool $value, string $message) { if (!$value) throw new RuntimeException($message); }

try {
    $product = new FixtureProduct();
    $products = [$product];
    $first = Zivic_Price_List_Publications::generate();
    check_publication($first['productCount'] === 1, 'Export count');
    $file = $root . '/zivic-price-lists/' . $first['filename'];
    $before = file_get_contents($file);
    check_publication(str_contains($before, '6.25;12.50;ne;'), 'Gross unit and selling prices');
    check_publication(str_contains($before, '12.50;2026-09-10;000123;dostupno'), 'Independent historical gross anchor');
    $second = Zivic_Price_List_Publications::generate();
    check_publication($first['filename'] !== $second['filename'], 'Immutable unique publications');
    check_publication(file_get_contents($file) === $before, 'Archive remains unchanged');
    check_publication(count($options['zpl_publications']) === 2, 'Archive retained');
    $saved = $options['zpl_publications'];
    $product->meta['_zpl_anchor_status'] = 'not_offered';
    $product->meta['_zpl_anchor_amount'] = '';
    try { Zivic_Price_List_Publications::generate(); throw new LogicException('Expected refusal'); }
    catch (RuntimeException $e) { check_publication(str_contains($e->getMessage(), '123'), 'Actionable product error'); }
    check_publication($options['zpl_publications'] === $saved, 'Invalid catalog does not replace current manifest');
    check_publication(count(glob($root . '/zivic-price-lists/.*.tmp')) === 0, 'No partial output left');
    $product->meta['_zpl_anchor_status'] = 'recorded';
    $product->meta['_zpl_anchor_amount'] = '12.50';
    $fail_manifest = true;
    try { Zivic_Price_List_Publications::generate(); throw new LogicException('Expected database refusal'); }
    catch (RuntimeException $e) { check_publication(str_contains($e->getMessage(), 'evidentirana'), 'Manifest error reported'); }
    check_publication($options['zpl_publications'] === $saved, 'Database failure preserves last known publication');
    echo "Publication contract tests passed\n";
} finally {
    foreach (glob($root . '/zivic-price-lists/*') as $path) unlink($path);
    foreach (glob($root . '/zivic-price-lists/.*') as $path) if (is_file($path)) unlink($path);
    rmdir($root . '/zivic-price-lists');
    rmdir($root);
}
