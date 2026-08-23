import React from 'react';
import { MessageSquare, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ChapterOverlay from './ChapterOverlay';
import HeadingAccent from '../components/HeadingAccent';
import MiniCardGrid from '../components/MiniCardGrid';
import { StartProjectButton } from './actions';

/** Chapter 3 — AI & Automation. Real AI copy + capability cards. */
const AIOverlay: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const { t } = useLanguage();
  const capabilities = [
    { label: t('ai_card_1_title'), Icon: MessageSquare },
    { label: t('ai_card_2_title'), Icon: Calendar },
  ];
  return (
    <ChapterOverlay
      index={index}
      total={total}
      eyebrow={t('ai_badge')}
      title={
        <>
          <span className="text-white">{t('ai_title_start')} </span>
          <HeadingAccent tone="cyan">{t('ai_title_highlight')}</HeadingAccent>
        </>
      }
      description={t('ai_desc')}
      actions={<StartProjectButton />}
    >
      <div className="mx-auto w-full max-w-md">
        <MiniCardGrid items={capabilities} />
      </div>
    </ChapterOverlay>
  );
};

export default AIOverlay;
