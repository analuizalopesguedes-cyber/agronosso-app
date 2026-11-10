import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

export type AbasParams = {
  Inicio: undefined;
  Documentos: undefined;
  Duvidas: undefined;
  Ajuda: undefined;
};

export type RaizParams = {
  BoasVindas: undefined;
  Abas: NavigatorScreenParams<AbasParams>;
  Fotografar: undefined;
  Lendo: { imagemUri?: string; exemploChave?: string };
  Explicacao: { id: string };
};

export type TelaRaiz<T extends keyof RaizParams> = NativeStackScreenProps<RaizParams, T>;

export type TelaAba<T extends keyof AbasParams> = CompositeScreenProps<
  BottomTabScreenProps<AbasParams, T>,
  NativeStackScreenProps<RaizParams>
>;
