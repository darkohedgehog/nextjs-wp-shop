<?php
declare(strict_types=1);

// Standalone WordPress boundary harness. No database, network or real media uploads.
$root = sys_get_temp_dir() . '/zpl-retail-' . bin2hex(random_bytes(6));
mkdir($root . '/wp-admin/includes', 0777, true);
mkdir($root . '/uploads');
foreach (['file', 'media', 'image'] as $include) file_put_contents($root . '/wp-admin/includes/' . $include . '.php', '<?php');
define('ABSPATH', $root . '/');
require_once __DIR__ . '/../includes/retail.php';
$options = []; $attachments = []; $can = true; $nonce = true; $fail_upload = false; $fail_save = false;
class RedirectDone extends RuntimeException {}
function get_option($key, $default = false) { return $GLOBALS['options'][$key] ?? $default; }
function update_option($key, $value, $autoload = null) {
    if ($key === 'zpl_retail' && $GLOBALS['fail_save']) return false;
    $GLOBALS['options'][$key] = $value; return true;
}
function delete_option($key) { unset($GLOBALS['options'][$key]); }
function current_user_can($cap) { return $GLOBALS['can']; }
function wp_die($message, $title, $args) { throw new RuntimeException('forbidden'); }
function check_admin_referer($action) { if (!$GLOBALS['nonce']) throw new RuntimeException('nonce'); }
function sanitize_text_field($value) { return trim(strip_tags($value)); }
function wp_unslash($value) { return $value; }
function wp_max_upload_size() { return 20000000; }
function admin_url($path) { return $path; }
function wp_safe_redirect($url) { throw new RedirectDone($url); }
function wp_upload_dir() { return ['basedir' => $GLOBALS['root'] . '/uploads', 'baseurl' => 'https://wp.example.com/wp-content/uploads']; }
function get_post_type($id) { return isset($GLOBALS['attachments'][$id]) ? 'attachment' : false; }
function get_attached_file($id) { return $GLOBALS['attachments'][$id] ?? false; }
function wp_get_attachment_url($id) { return 'https://wp.example.com/wp-content/uploads/' . basename($GLOBALS['attachments'][$id]); }
function is_wp_error($value) { return $value === false; }
function media_handle_upload($slot, $parent, $data, $overrides) {
    if ($GLOBALS['fail_upload'] === $slot) return false;
    check(isset($overrides['mimes']['xls']) && !isset($overrides['mimes']['php']), 'Upload type allowlist');
    $id = count($GLOBALS['attachments']) + 1;
    $path = $GLOBALS['root'] . '/uploads/' . $id . '-' . $_FILES[$slot]['name'];
    file_put_contents($path, 'fixture'); $GLOBALS['attachments'][$id] = $path;
    return $id;
}
function check($condition, $message) { if (!$condition) throw new RuntimeException($message); }
function save() { try { Zivic_Retail_Price_Lists::save(); } catch (RedirectDone $redirect) { return $redirect->getMessage(); } }
function upload($name) { return ['name' => $name, 'size' => 100, 'error' => UPLOAD_ERR_OK]; }

try {
    check(Zivic_Retail_Price_Lists::manifest()['files'] === [], 'Empty installation');
    $_POST = ['name' => 'Maloprodaja', 'address' => 'Adresa 1', 'current_date' => '2026-09-18', 'anchor_date' => '2026-09-10'];
    $_FILES = ['current' => upload('Current.xls'), 'anchor' => upload('Anchor.xls')];
    $can = false;
    try { save(); throw new LogicException('Expected capability failure'); } catch (RuntimeException $e) { check($e->getMessage() === 'forbidden', 'Permission enforced'); }
    $can = true; $nonce = false;
    try { save(); throw new LogicException('Expected nonce failure'); } catch (RuntimeException $e) { check($e->getMessage() === 'nonce', 'Nonce enforced'); }
    $nonce = true;
    check(str_contains(save(), 'retail=saved'), 'Initial publish');
    $initial = $options['zpl_retail'];
    check(count(Zivic_Retail_Price_Lists::manifest()['files']) === 2, 'Both files public');
    $_FILES = [];
    check(str_contains(save(), 'retail=saved') && $options['zpl_retail'] === $initial, 'No upload keeps previous');
    $_FILES = ['current' => upload('New.xls'), 'anchor' => upload('Bad.xls')]; $fail_upload = 'anchor';
    check(str_contains(save(), 'retail=error') && $options['zpl_retail'] === $initial, 'Second upload failure preserves both links');
    $fail_upload = false; $_FILES = ['current' => upload('New.xls')]; $fail_save = true;
    check(str_contains(save(), 'retail=error') && $options['zpl_retail'] === $initial, 'Database failure preserves links');
    $fail_save = false;
    check(str_contains(save(), 'retail=saved'), 'Replacement succeeds');
    check($options['zpl_retail']['files']['anchor'] === $initial['files']['anchor'], 'Reference publication unchanged');
    check(is_file($attachments[$initial['files']['current']['attachmentId']]), 'Old file preserved');
    $saved = $options['zpl_retail'];
    $_FILES = ['current' => upload('code.php')];
    check(str_contains(save(), 'retail=error') && $options['zpl_retail'] === $saved, 'Disallowed type rejected');
    $_FILES = []; $_POST['current_date'] = '2026-02-30';
    check(str_contains(save(), 'retail=error') && $options['zpl_retail'] === $saved, 'Invalid calendar date rejected');
    $_POST['remove_current'] = '1';
    check(str_contains(save(), 'retail=saved') && count(Zivic_Retail_Price_Lists::manifest()['files']) === 1, 'Unpublish one slot');
    unlink($attachments[$initial['files']['anchor']['attachmentId']]);
    check(Zivic_Retail_Price_Lists::manifest()['files'] === [], 'Deleted media does not leave broken links');
    $attachments[999] = $root . '/outside.xls'; file_put_contents($attachments[999], 'fixture');
    check(Zivic_Retail_Price_Lists::attachment(999) === null, 'Outside uploads rejected');
    echo "Retail publication tests passed\n";
} finally {
    foreach (glob($root . '/uploads/*') as $path) unlink($path);
    foreach (glob($root . '/wp-admin/includes/*') as $path) unlink($path);
    if (is_file($root . '/outside.xls')) unlink($root . '/outside.xls');
    rmdir($root . '/uploads'); rmdir($root . '/wp-admin/includes'); rmdir($root . '/wp-admin'); rmdir($root);
}
