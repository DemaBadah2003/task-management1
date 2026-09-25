import Image from 'next/image';
import { cn } from '@/src/lib/utils';
import { passwordRules } from '@/src/lib/validations/sign-up-schema';

// 1. دالة قائمة شروط التسجيل (3 شروط مطابقة للصورة)
export function PasswordChecklistSignUp({ password }: { password: string }) {
  // تعريف الشروط الثلاثة بناءً على الصورة المرفقة
  const signUpRules = [
    {
      id: 'length',
      label: 'At least 8 characters',
      test: (pwd: string) => pwd.length >= 8,
    },
    {
      id: 'combination',
      label: 'One uppercase, lowercase, and digit',
      test: (pwd: string) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd),
    },
    {
      id: 'special',
      label: 'One special character',
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
  ];

  return (
    <div className="bg-checklist-bg hidden rounded-lg p-3.5 sm:block sm:p-4">
      <ul className="flex flex-col gap-2">
        {signUpRules.map((rule) => {
          const passed = rule.test(password);
          return (
            <li
              key={rule.id}
              className={cn(
                'flex items-center gap-2 text-[11px] leading-[16.5px] font-normal tracking-normal transition-colors',
                passed ? 'text-success font-semibold' : 'text-slate-500'
              )}
            >
              <Image
                src={passed ? '/icons/check.svg' : '/icons/circle.svg'}
                alt={passed ? 'Passed' : 'Not passed'}
                width={14}
                height={14}
                className="h-3.5 w-3.5 shrink-0"
              />
              <span>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// 2. دالة قائمة شروط إعادة تعيين كلمة المرور (5 شروط الأصلية)
export function PasswordChecklistReset({ password }: { password: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-[4px] border border-[#C3C6D6]/10 bg-[#F1F3FF]/50 p-[20px]">
      <h3 className="text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#4F5F7B] uppercase sm:text-[#434654]">
        Security Requirements
      </h3>
      <ul className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {passwordRules.map((rule) => {
          const passed = rule.test(password);
          const mobileOrder: Record<string, string> = {
            length: 'order-1',
            lowercase: 'order-2',
            uppercase: 'order-3',
            digit: 'order-4',
            special: 'order-5',
          };
          const desktopOrder: Record<string, string> = {
            length: 'sm:order-1',
            uppercase: 'sm:order-2',
            lowercase: 'sm:order-3',
            digit: 'sm:order-4',
            special: 'sm:order-5',
          };
          return (
            <li
              key={rule.id}
              className={cn(
                'flex flex-1 items-center gap-2 font-sans text-[13px] leading-[19.5px] font-normal whitespace-nowrap transition-colors',
                mobileOrder[rule.id],
                desktopOrder[rule.id],
                passed ? 'text-[#041B3C]' : 'text-[#041B3C]/50'
              )}
            >
              <Image
                src={passed ? '/icons/check.svg' : '/icons/circle.svg'}
                alt={passed ? 'Passed' : 'Not passed'}
                width={14}
                height={14}
                className="h-3.5 w-3.5 shrink-0"
              />
              <span>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
