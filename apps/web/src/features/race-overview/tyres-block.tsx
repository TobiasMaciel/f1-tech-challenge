import type { TyreInfo } from '@f1/shared';
import { CompoundBadge } from '@/components/compound-badge';
import { HorizontalScroll } from '@/components/horizontal-scroll';
import { InfoHint } from '@/components/info-hint';
import { COMPOUNDS, getCompoundInfo } from '@/lib/compounds';
import { formatPercent, formatSignedSeconds } from '@/lib/format';

const NUMBER_CELL = 'py-2 pl-4 text-right whitespace-nowrap';

/** Table of the race compounds with their pace, degradation and rain band, from dry to wet. */
export function TyresBlock({ tyres }: { tyres: TyreInfo[] }) {
  const orderedTyres = COMPOUNDS.flatMap(({ compound }) =>
    tyres.filter((tyre) => tyre.compound === compound),
  );

  return (
    <section aria-labelledby="tyres-title" className="space-y-3 rounded-lg border bg-card p-4">
      <h3 id="tyres-title" className="font-semibold">
        Neumáticos
      </h3>
      <HorizontalScroll label="Tabla de neumáticos">
        <table className="w-full text-sm whitespace-nowrap tabular-nums">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="pb-2 text-left font-normal">
                <span className="inline-flex items-center gap-1">
                  Compuesto
                  <InfoHint term="el compuesto">
                    El tipo de neumático: blando, medio y duro para seco; intermedio y lluvia
                    extrema para pista mojada.
                  </InfoHint>
                </span>
              </th>
              <ColumnHeader label="Diferencia por vuelta" term="la diferencia por vuelta">
                Segundos por vuelta que suma o resta el compuesto frente a la vuelta base; negativo
                es más rápido.
              </ColumnHeader>
              <ColumnHeader label="Degradación" term="la degradación">
                Segundos que pierde el compuesto por cada vuelta de uso, multiplicados por el
                desgaste del circuito.
              </ColumnHeader>
              <ColumnHeader label="Rendimiento en mojado" term="el rendimiento en mojado">
                Agarre del compuesto con lluvia: cuanto menor, más tiempo pierde fuera de su banda
                óptima.
              </ColumnHeader>
              <ColumnHeader label="Lluvia óptima (0–1)" term="la lluvia óptima">
                Banda de intensidad de lluvia en la que el compuesto no se penaliza; fuera de ella
                pierde tiempo.
              </ColumnHeader>
            </tr>
          </thead>
          <tbody>
            {orderedTyres.map((tyre) => (
              <tr key={tyre.compound} className="border-t">
                <td className="py-2">
                  <span className="flex items-center gap-2">
                    <CompoundBadge compound={tyre.compound} />
                    <span aria-hidden="true">{getCompoundInfo(tyre.compound).label}</span>
                  </span>
                </td>
                <td className={NUMBER_CELL}>{formatSignedSeconds(tyre.pace)}</td>
                <td className={NUMBER_CELL}>{tyre.degradation} s/vuelta</td>
                <td className={NUMBER_CELL}>{formatPercent(tyre.wetPerformance)}</td>
                <td className={NUMBER_CELL}>
                  {tyre.optimalRainIntensity.min.toFixed(2)}–
                  {tyre.optimalRainIntensity.max.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </HorizontalScroll>
    </section>
  );
}

function ColumnHeader({
  label,
  term,
  children,
}: {
  label: string;
  term: string;
  children: string;
}) {
  return (
    <th className="pb-2 pl-4 text-right font-normal">
      <span className="inline-flex items-center justify-end gap-1">
        {label}
        <InfoHint term={term}>{children}</InfoHint>
      </span>
    </th>
  );
}
