<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/domain.php';

function check(bool $condition, string $message): void {
    if (!$condition) { throw new RuntimeException($message); }
}
function rejects(callable $action, string $message): void {
    try { $action(); } catch (InvalidArgumentException $e) { return; }
    throw new RuntimeException($message);
}

check(Zivic_Price_List_Domain::money('12,30') === '12.30', 'Normalize decimal comma');
check(Zivic_Price_List_Domain::money('0') === '0.00', 'Zero is a valid amount');
foreach (['-1', 'NaN', '1e3', '12x', '', '1.234', '12,34.56'] as $invalid) {
    rejects(fn() => Zivic_Price_List_Domain::money($invalid), 'Reject invalid money: ' . $invalid);
}
check(Zivic_Price_List_Domain::anchor('recorded', '12.30', '2026-09-10')['amount'] === '12.30', 'Recorded anchor');
check(Zivic_Price_List_Domain::anchor('not_offered', '', '2026-09-10')['amount'] === null, 'New product is not zero');
rejects(fn() => Zivic_Price_List_Domain::anchor('recorded', '', '2026-09-10'), 'Missing amount');
rejects(fn() => Zivic_Price_List_Domain::anchor('recorded', '10', '2026-02-31'), 'Invalid date');
rejects(fn() => Zivic_Price_List_Domain::anchor('unknown', '10', '2026-09-10'), 'Unknown is not recorded');

$row = ['name' => 'Cable; "A"', 'sku' => '0012', 'brand' => 'Brand', 'unit' => 'm', 'unit_price' => '2.50', 'price' => '5.00', 'promotion' => '', 'anchor' => Zivic_Price_List_Domain::anchor('recorded', '5', '2026-09-10'), 'barcode' => '001234', 'available' => true];
$columns = Zivic_Price_List_Domain::columns($row);
check($columns[1] === '0012' && $columns[10] === '001234', 'Preserve leading zero identifiers');
$stream = fopen('php://temp', 'w+');
Zivic_Price_List_Domain::write_csv($stream, $columns);
rewind($stream);
check(fgetcsv($stream, 0, ';', '"', '') === $columns, 'CSV delimiters and quotes roundtrip');
fclose($stream);
foreach (['unknown', 'not_offered'] as $status) {
    $bad = $row;
    $bad['anchor'] = Zivic_Price_List_Domain::anchor($status, '', '2026-09-10');
    rejects(fn() => Zivic_Price_List_Domain::columns($bad), 'Block unresolved legal representation');
}
$bad = $row; $bad['barcode'] = '';
rejects(fn() => Zivic_Price_List_Domain::columns($bad), 'Missing barcode must be visible');
$bad = $row; $bad['name'] = '=HYPERLINK("bad")';
rejects(fn() => Zivic_Price_List_Domain::columns($bad), 'Reject spreadsheet formula injection');
check(Zivic_Price_List_Domain::selling_price('10', '8', 100, 200, 150) === '8.00', 'Current promotion');
check(Zivic_Price_List_Domain::selling_price('10', '8', 100, 200, 201) === '10.00', 'Expired promotion');
check(Zivic_Price_List_Domain::selling_price('10', '8', 100, 200, 99) === '10.00', 'Scheduled promotion');
echo "Domain tests passed\n";
