import { useI18n } from 'vue-i18n';
import { pointsTypeLabel } from '../constants';

/**
 * Returns a function that translates points program names (e.g. Aeroplan → Aéroplan in French).
 * Falls back to pointsTypeLabel(type) when no translation exists.
 */
export function useTranslatedPointsType() {
  const { t } = useI18n();
  return (type) => {
    if (!type) return '';
    const key = `pointsPrograms.${type}`;
    const translated = t(key);
    return translated === key ? pointsTypeLabel(type) : translated;
  };
}
