-- Migration: Allow guest checkout and atomic stock decrement on order items

-- 1. Make user_id in orders nullable to allow guest checkouts
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Update RLS policies on orders to allow guest (anon) inserts
DROP POLICY IF EXISTS "own_orders_insert" ON public.orders;
CREATE POLICY "orders_insert_policy" ON public.orders 
FOR INSERT TO anon, authenticated 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- 3. Update RLS policies on order_items to allow inserting items for guest orders
DROP POLICY IF EXISTS "own_order_items_insert" ON public.order_items;
CREATE POLICY "order_items_insert_policy" ON public.order_items 
FOR INSERT TO anon, authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_id 
    AND (o.user_id IS NULL OR o.user_id = auth.uid())
  )
);

-- 4. Atomic stock decrement trigger function
CREATE OR REPLACE FUNCTION public.handle_order_item_stock_decrement()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Atomically deduct stock and ensure stock does not go below zero
  UPDATE public.products
  SET stock = GREATEST(0, stock - NEW.quantity),
      updated_at = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

-- 5. Attach trigger to order_items table
DROP TRIGGER IF EXISTS trg_order_items_decrement_stock ON public.order_items;
CREATE TRIGGER trg_order_items_decrement_stock
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_item_stock_decrement();
