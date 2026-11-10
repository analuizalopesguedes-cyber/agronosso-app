import React, { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors } from '../theme';
import { LOGO_RATIO, LOGO_SVG } from '../theme/logo';

type Props = {
  /** Largura em px. Mínimo de 96px (regra da marca). */
  largura?: number;
  /** Versão invertida: Papel sobre Verde profundo. */
  invertido?: boolean;
};

/**
 * Logo oficial AgroNosso, usado exatamente como no arquivo SVG.
 * A versão invertida troca apenas o fill #292A24 por #F4EFE4.
 * A área de respiro (mín. 1/4 da altura) é arredondada para a grade de 8px.
 */
export function Logo({ largura = 120, invertido = false }: Props) {
  const w = Math.max(96, largura);
  const h = w / LOGO_RATIO;
  const xml = useMemo(
    () => (invertido ? LOGO_SVG.split('fill="#292A24"').join(`fill="${colors.papel}"`) : LOGO_SVG),
    [invertido],
  );

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="AgroNosso"
      style={{ padding: Math.ceil(h / 4 / 8) * 8 }}
    >
      <SvgXml xml={xml} width={w} height={h} />
    </View>
  );
}
