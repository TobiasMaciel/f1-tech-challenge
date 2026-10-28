import be from 'flag-icons/flags/4x3/be.svg';
import bh from 'flag-icons/flags/4x3/bh.svg';
import ca from 'flag-icons/flags/4x3/ca.svg';
import gb from 'flag-icons/flags/4x3/gb.svg';
import it from 'flag-icons/flags/4x3/it.svg';
import mc from 'flag-icons/flags/4x3/mc.svg';
import sg from 'flag-icons/flags/4x3/sg.svg';

/**
 * Flag image URL of each country name the API returns. Only these files are bundled:
 * the flag-icons stylesheet would ship every country.
 */
const FLAGS: Record<string, string> = {
  Bahrain: bh,
  Monaco: mc,
  Canada: ca,
  'United Kingdom': gb,
  Belgium: be,
  Italy: it,
  Singapore: sg,
};

/** Small decorative flag next to the country name; renders nothing for an unknown country. */
export function CountryFlag({ country }: { country: string }) {
  const src = FLAGS[country];
  if (!src) return null;

  return <img src={src} alt="" className="h-3 w-4 shrink-0 rounded-xs object-cover" />;
}
