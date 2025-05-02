export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  SearchPage: undefined;
  CreateReport: undefined;
  ClientHomePage: undefined;
  Revenue: { reportId: string; selectedCompany?: string | null};
  BSPLPage: { reportId: string; selectedCompany: string | null };
};
