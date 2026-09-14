import Image from 'next/image';
import { cn } from '@/src/lib/utils';
import { passwordRules } from '@/src/lib/validations/sign-up-schema';

export function PasswordChecklist({ password }: { password: string }) {
  return (
    <div className="bg-checklist-bg hidden rounded-lg p-3.5 sm:block sm:p-4">
      <ul className="flex flex-col gap-2">
        {passwordRules.map((rule) => {
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
