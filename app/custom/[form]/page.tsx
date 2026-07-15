import Link from "next/link";
import { CustomForm } from "@/components/custom-form";
import { customPlans } from "@/data/site";
import { findProduct } from "@/services/product-service";

const formMap: Record<string, number> = {
  form: 0,
  "form-b": 1,
  "form-c": 2,
  "form-d": 3
};

const customBraceletSlug = "custom-aura-bracelet";

export default async function CustomFormPage({ params }: { params: { form: string } }) {
  const plan = customPlans[formMap[params.form] ?? 0];
  const product = await findProduct(customBraceletSlug);

  return (
    <section className="container-shell py-12">
      <Link className="text-sm text-crystal-muted" href="/custom">
        返回
      </Link>
      <div className="mt-6 rounded-md border border-crystal-line bg-white/70 p-6 shadow-soft md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">報名表單</p>
        <h1 className="mt-3 font-serif text-5xl font-semibold">{plan.title}</h1>
        <section className="mt-8 rounded-md bg-crystal-pearl p-5">
          <h2 className="text-xl font-semibold">訂購流程與手鍊注意事項</h2>
          <ol className="mt-4 space-y-2 text-sm leading-7 text-crystal-muted">
            <li>1. 填寫報名表單，提供手圍、材質偏好與設計需求。</li>
            <li>2. 支付訂金並加入官方 LINE，等待設計師傳送水晶搭配圖。</li>
            <li>3. 初版確認後提供尾款報價，尾款支付完畢後準備出貨。</li>
          </ol>
        </section>
        <CustomForm planCode={plan.code} product={product} />
      </div>
    </section>
  );
}
