import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getMyProfile, updateMyProfile } from "@/lib/orders.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "حسابي — So Beauty" }] }),
  component: AccountPage,
});

function AccountPage() {
  const load = useServerFn(getMyProfile);
  const save = useServerFn(updateMyProfile);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", city: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load()
      .then((p) => {
        if (p)
          setForm({
            full_name: p.full_name ?? "",
            phone: p.phone ?? "",
            address: p.address ?? "",
            city: p.city ?? "",
          });
      })
      .catch(() => {});
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await save({ data: form });
      const p = await load();
      if (p)
        setForm({
          full_name: p.full_name ?? "",
          phone: p.phone ?? "",
          address: p.address ?? "",
          city: p.city ?? "",
        });
      toast.success("تم حفظ المعلومات بنجاح");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">حسابي</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>الاسم الكامل</Label>
            <Input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <Label>رقم الهاتف</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <Label>المدينة</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>العنوان</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "..." : "حفظ"}
          </Button>
        </form>
        <div className="mt-6">
          <Link to="/orders" className="text-primary underline">
            عرض طلباتي
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
