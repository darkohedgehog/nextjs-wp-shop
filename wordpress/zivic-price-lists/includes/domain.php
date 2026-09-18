<?php
declare(strict_types=1);

/** Pure validation/serialization rules; independent of WordPress and customer sessions. */
final class Zivic_Price_List_Domain {
    public static function money(string $value): string {
        $value = str_replace(',', '.', trim($value));
        if (!preg_match('/^\d{1,9}(?:\.\d{1,2})?$/D', $value)) {
            throw new InvalidArgumentException('Iznos mora biti nenegativan broj s najviše dvije decimale.');
        }
        return number_format((float) $value, 2, '.', '');
    }

    public static function anchor(string $status, string $amount, string $date): array {
        if (!in_array($status, ['recorded', 'unknown', 'not_offered'], true)) {
            throw new InvalidArgumentException('Nepoznat status sidrene cijene.');
        }
        $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        if (!$parsed || $parsed->format('Y-m-d') !== $date) {
            throw new InvalidArgumentException('Neispravan referentni datum.');
        }
        if ($status !== 'recorded' && trim($amount) !== '') {
            throw new InvalidArgumentException('Iznos se unosi samo za potvrđenu povijesnu cijenu.');
        }
        return ['status' => $status, 'amount' => $status === 'recorded' ? self::money($amount) : null, 'referenceDate' => $date, 'currency' => 'EUR'];
    }

    public static function selling_price(string $regular, string $sale, ?int $from, ?int $to, int $now): string {
        $regular = self::money($regular);
        if ($sale !== '' && (!$from || $now >= $from) && (!$to || $now <= $to)) {
            $sale = self::money($sale);
            if ((float) $sale < (float) $regular) return $sale;
        }
        return $regular;
    }

    private static function text(string $value, bool $required = true): string {
        $value = trim($value);
        if (($required && $value === '') || strlen($value) > 1000 || preg_match('/^[=+@-]|[\x00-\x1F\x7F]/', $value)) {
            throw new InvalidArgumentException('Nedostaje obvezni podatak ili sadrži nedopuštene znakove/formulu.');
        }
        return $value;
    }

    public static function headers(): array {
        return ['naziv', 'sifra', 'marka', 'jedinica_mjere', 'cijena_za_jedinicu_mjere', 'maloprodajna_cijena', 'poseban_oblik_prodaje', 'naziv_posebnog_oblika_prodaje', 'sidrena_cijena', 'datum_sidrene_cijene', 'barkod', 'dostupnost'];
    }

    public static function columns(array $row): array {
        $anchor = $row['anchor'];
        if ($anchor['status'] !== 'recorded' || $anchor['amount'] === null) {
            throw new InvalidArgumentException('Sidrena cijena nije potvrđena; za nove artikle potrebno je potvrditi pravilo objave.');
        }
        $unit = self::text($row['unit'], false);
        if (($unit === '') !== ($row['unit_price'] === '')) {
            throw new InvalidArgumentException('Jedinica mjere i cijena za jedinicu mjere moraju biti usklađene.');
        }
        $promotion = self::text($row['promotion'], false);
        return [self::text($row['name']), self::text($row['sku']), self::text($row['brand']), $unit,
            $unit === '' ? '' : self::money($row['unit_price']), self::money($row['price']),
            $promotion === '' ? 'ne' : 'da', $promotion, self::money($anchor['amount']),
            $anchor['referenceDate'], self::text($row['barcode']), $row['available'] ? 'dostupno' : 'nedostupno'];
    }

    public static function write_csv($stream, array $columns): void {
        if (fputcsv($stream, $columns, ';', '"', '', "\r\n") === false) {
            throw new RuntimeException('Zapisivanje cjenika nije uspjelo.');
        }
    }
}
