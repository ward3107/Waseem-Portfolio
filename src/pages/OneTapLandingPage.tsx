import React from 'react';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, MessageCircle, Sparkles, Zap, Contact, Globe2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { demoUrl } from '@/features/onetap/variants';

const copy = {
  he: {
    title: 'כרטיס הביקור שמשאיר רושם.',
    subtitle: 'כל העסק שלך בלחיצה אחת. בלי הורדת אפליקציה, עם WhatsApp ישיר, QR אישי וכרטיס שמרגיש כמו מותג.',
    first: 'Classic', second: 'Motion', third: 'Signature',
    intro: 'שלושה מסלולים. בחירה אחת חכמה.',
    classic: 'כרטיס מעוצב וסטטי עם כל דרכי הקשר. ללא אנימציית לוגו.',
    motion: 'הכול כמו Classic, עם סיבוב V עדין, טבעות זוהרות ואפקטי תנועה קלים.',
    custom: 'עיצוב ופונקציות בהתאמה אישית לאחר אפיון קצר.',
    price: 'תשלום חד־פעמי על יצירת הכרטיס', from: 'החל מ־',
    demo: 'צפייה בהדגמה', ask: 'לקבלת הצעת מחיר', order: 'הזמינו דרך WhatsApp',
    benefits: ['QR אישי', 'WhatsApp ישיר', 'אתר ורשתות', 'שמירת איש קשר', 'מותאם לטלפון'],
    note: 'מחירי יצירה בלבד. דומיין פרטי, פיתוחים מיוחדים, תנאי אחסון ותחזוקה יוגדרו בהצעה לפני תשלום.',
    caption: 'VASIA OneTap • Digital Cards',
  },
  ar: {
    title: 'بطاقة أعمال تترك انطباعًا.',
    subtitle: 'كل تفاصيل مصلحتك بضغطة واحدة. بدون تنزيل تطبيق، مع واتساب مباشر ورمز QR خاص.',
    first: 'Classic', second: 'Motion', third: 'Signature',
    intro: 'ثلاث باقات. تجربة واحدة ذكية.',
    classic: 'بطاقة أنيقة وثابتة مع جميع روابط التواصل، بدون حركة للشعار.',
    motion: 'كل مزايا Classic، مع دوران خفيف للشعار وحلقات مضيئة وتأثيرات متحركة.',
    custom: 'تصميم ووظائف مخصصة حسب احتياجات مصلحتك.',
    price: 'دفعة واحدة مقابل إنشاء البطاقة', from: 'ابتداءً من ',
    demo: 'شاهد المثال', ask: 'اطلب عرض سعر', order: 'اطلب عبر واتساب',
    benefits: ['رمز QR خاص', 'واتساب مباشر', 'موقع وسوشيال', 'حفظ جهة الاتصال', 'ملائم للموبايل'],
    note: 'الأسعار لإنشاء البطاقة. الاستضافة والصيانة والدومين الخاص أو التطوير الإضافي تحدد في العرض قبل الدفع.',
    caption: 'VASIA OneTap • Digital Cards',
  },
  en: {
    title: 'A business card worth remembering.',
    subtitle: 'Your entire business, one tap away. No app required for visitors, with direct WhatsApp, personal QR, and premium design.',
    first: 'Classic', second: 'Motion', third: 'Signature',
    intro: 'Three packages. One smarter connection.',
    classic: 'Beautiful static digital card with all contact actions. No animated logo.',
    motion: 'All Classic features, plus a floating rotating logo, glowing rings and subtle motion.',
    custom: 'Custom designs and features, scoped to your needs.',
    price: 'One-time card creation fee', from: 'From ',
    demo: 'View live demo', ask: 'Request a quote', order: 'Order on WhatsApp',
    benefits: ['Personal QR', 'Direct WhatsApp', 'Website + social', 'Save contact', 'Mobile-ready'],
    note: 'Creation pricing only. Hosting, maintenance, private domains and custom work are quoted before payment.',
    caption: 'VASIA OneTap • Digital Cards',
  },
};

const Landing: React.FC = () => {
  const { language, setLanguage, dir } = useLanguage();
  const c = copy[language];
  useDocumentTitle('VASIA OneTap | Classic • Motion • Signature');
  const message = language === 'he' ? 'היי, אני רוצה להזמין VASIA OneTap'
    : language === 'ar' ? 'مرحباً، أريد طلب بطاقة VASIA OneTap'
      : 'Hi, I would like to order a VASIA OneTap card';
  const wa = 'https://wa.me/972534260632?text=' + encodeURIComponent(message);
  const plans = [
    {name:c.first, price:'199', description:c.classic, href:demoUrl('classic',language), glow:'#3AAFEA', icon:Contact},
    {name:c.second, price:'399', description:c.motion, href:demoUrl('motion',language), glow:'#8871FD', icon:Zap},
    {name:c.third, price:'499', description:c.custom, href:wa, glow:'#39D3B8', icon:Sparkles},
  ];
  return (
    <main dir={dir} className="min-h-screen bg-[#eef6ff] text-[#132c5d]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_8%_10%,#bed2ff,transparent_45%),radial-gradient(ellipse_at_88%_60%,#c4f2f1,transparent_48%)]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-7">
        <header className="flex items-center justify-between">
          <a href="https://vasia.dev" className="flex items-center gap-2" dir="ltr">
            <img src="/onetap/vasia-v.svg" width="44" height="44" alt="" />
            <span className="text-xl font-black tracking-[.17em]">VASIA <span className="font-semibold tracking-normal text-[#4e66cf]">OneTap</span></span>
          </a>
          <nav dir="ltr" aria-label="Language" className="flex gap-1 rounded-full border border-[#b9ccef] bg-white/80 p-1">
            {(['he','ar','en'] as const).map(code=>(
              <button type="button" key={code} onClick={()=>setLanguage(code)} aria-pressed={language===code} className={'min-h-10 min-w-10 rounded-full text-xs font-bold '+(language===code?'bg-[#3267bc] text-white':'text-[#45629a]')}>{code.toUpperCase()}</button>
            ))}
          </nav>
        </header>
        <section className="mx-auto max-w-3xl py-12 text-center sm:py-16">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-[#9dbaf1] bg-white/80 px-4 py-2 text-xs font-bold tracking-wide text-[#335db1]">
            <Globe2 size={16} aria-hidden="true" /> {c.caption}
          </div>
          <h1 className="text-4xl font-black leading-tight sm:text-6xl">{c.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#4a6192] sm:text-lg">{c.subtitle}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {c.benefits.map(item=><span key={item} className="rounded-full border border-white bg-white/65 px-3 py-2 text-xs font-semibold text-[#355e98]"><Check size={13} className="inline-block" aria-hidden="true" /> {item}</span>)}
          </div>
        </section>
        <h2 className="mb-7 text-center text-2xl font-bold">{c.intro}</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan,i)=>(
            <article key={plan.name} className={'relative flex flex-col rounded-[30px] border border-white bg-white/80 p-6 shadow-[0_16px_50px_-26px_#5267ab] backdrop-blur-xl '+(i===1?'ring-2 ring-[#8c84fa]':'')}>
              <span className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-[#edf5ff]" style={{color:plan.glow}}><plan.icon size={30} aria-hidden="true"/></span>
              <h3 className="text-2xl font-extrabold">{plan.name}</h3>
              <p className="mt-3 min-h-20 text-sm leading-7 text-[#50678c]">{plan.description}</p>
              <p className="mt-4 text-xs text-[#557198]">{i===2?c.from:c.price}</p>
              <p className="mt-1 text-4xl font-black tracking-tight" dir="ltr"><span className="text-xl">₪</span>{plan.price}</p>
              <a href={plan.href} target={i===2?'_blank':undefined} rel={i===2?'noopener noreferrer':undefined}
                className="mt-7 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#276fc1] px-4 text-center text-sm font-bold text-white shadow-md transition-colors hover:bg-[#1d54a7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#276fc1]">
                {i===2?c.ask:c.demo}
                {dir==='rtl'?<ChevronLeft size={18} aria-hidden="true"/>:<ChevronRight size={18} aria-hidden="true"/>}
              </a>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-3xl rounded-3xl bg-white/75 px-5 py-5 text-center">
          <p className="text-sm leading-7 text-[#50668a]">{c.note}</p>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="mx-auto mt-4 flex w-fit min-h-12 items-center gap-2 rounded-full bg-[#138868] px-6 text-sm font-bold text-white">
            <MessageCircle size={19} aria-hidden="true" />{c.order}<ArrowUpRight size={17} aria-hidden="true"/>
          </a>
          <p dir="ltr" className="mt-4 text-xs text-[#60779d]">053-4260632 • vasia.dev</p>
        </div>
      </div>
    </main>
  );
};
export default Landing;
