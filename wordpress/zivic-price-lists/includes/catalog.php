<?php
defined('ABSPATH') || exit;

final class Zivic_Price_List_Catalog {
    public static function anchor($product): array {
        return Zivic_Price_List_Domain::anchor(
            (string) ($product->get_meta('_zpl_anchor_status', true, 'edit') ?: 'unknown'),
            (string) $product->get_meta('_zpl_anchor_amount', true, 'edit'),
            (string) ($product->get_meta('_zpl_anchor_date', true, 'edit') ?: '2026-09-10')
        );
    }

    public static function rest_anchor($response, $product) {
        try { $response->data['zpl_anchor'] = self::anchor($product); }
        catch (InvalidArgumentException $e) { $response->data['zpl_anchor'] = null; }
        return $response;
    }

    /** Prices are read in edit context so a logged-in B2B administrator cannot change the export. */
    public static function row($product, int $now): array {
        $regular = (string) $product->get_regular_price('edit');
        $sale = (string) $product->get_sale_price('edit');
        $from = $product->get_date_on_sale_from('edit');
        $to = $product->get_date_on_sale_to('edit');
        $price = Zivic_Price_List_Domain::selling_price($regular, $sale, $from ? $from->getTimestamp() : null, $to ? $to->getTimestamp() : null, $now);
        $promotion = '';
        if ((float) $price < (float) $regular) {
            $promotion = (string) $product->get_meta('_zpl_promotion', true, 'edit');
            if ($promotion === '') throw new InvalidArgumentException('Unesite naziv posebnog oblika prodaje.');
        }
        // Convert raw configured prices to Croatian base gross prices without customer/session tax filters.
        $gross = (float) $price;
        if (wc_tax_enabled() && $product->get_tax_status('edit') === 'taxable' && get_option('woocommerce_prices_include_tax') !== 'yes') {
            $rates = WC_Tax::get_base_tax_rates($product->get_tax_class('edit'));
            $gross += array_sum(WC_Tax::calc_tax($gross, $rates, false));
        }
        $gross = number_format($gross, 2, '.', '');
        $unit = (string) $product->get_meta('_zpl_unit', true, 'edit');
        $quantity = (string) $product->get_meta('_zpl_unit_quantity', true, 'edit');
        $unit_price = '';
        if ($unit !== '') {
            if (!is_numeric($quantity) || (float) $quantity <= 0 || !is_finite((float) $quantity)) {
                throw new InvalidArgumentException('Unesite pozitivnu količinu u jedinici mjere.');
            }
            $unit_price = number_format((float) $gross / (float) $quantity, 2, '.', '');
        } elseif ($quantity !== '') {
            throw new InvalidArgumentException('Količina je unesena bez jedinice mjere.');
        }
        $brand = (string) $product->get_meta('_zpl_brand', true, 'edit');
        $term_id = $product->get_parent_id() ?: $product->get_id();
        if ($brand === '') {
            foreach (['pwb-brand', 'product_brand'] as $taxonomy) {
                if (!taxonomy_exists($taxonomy)) continue;
                $terms = wp_get_post_terms($term_id, $taxonomy, ['fields' => 'names']);
                if (!is_wp_error($terms) && $terms) { $brand = implode(', ', $terms); break; }
            }
        }
        $barcode = (string) $product->get_meta('_zpl_barcode', true, 'edit');
        if ($barcode === '' && method_exists($product, 'get_global_unique_id')) {
            $barcode = (string) $product->get_global_unique_id('edit');
        }
        return ['name' => wp_strip_all_tags($product->get_name()), 'sku' => (string) $product->get_sku('edit'),
            'brand' => $brand, 'unit' => $unit, 'unit_price' => $unit_price, 'price' => $gross,
            'promotion' => $promotion, 'anchor' => self::anchor($product), 'barcode' => $barcode,
            'available' => $product->get_stock_status('edit') === 'instock'];
    }

    public static function products(): Generator {
        $page = 1;
        do {
            $products = wc_get_products(['status' => 'publish', 'limit' => 100, 'page' => $page++, 'orderby' => 'ID', 'order' => 'ASC']);
            foreach ($products as $product) {
                if ($product->get_catalog_visibility('edit') === 'hidden' || get_post_field('post_password', $product->get_id()) !== '') continue;
                if ($product->is_type('variable')) {
                    foreach ($product->get_children() as $id) {
                        $variation = wc_get_product($id);
                        if ($variation && $variation->get_status('edit') === 'publish') yield $variation;
                    }
                } elseif ($product->is_type('simple')) {
                    yield $product;
                } else {
                    throw new InvalidArgumentException('Nepodržan tip proizvoda, ID ' . $product->get_id());
                }
            }
        } while (count($products) === 100);
    }
}
