export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  SearchPage: undefined;
  CreateReport: undefined;
  ClientHomePage: undefined;
  BSPL: { reportId: string; selectedCompany?: string };
  Revenue: {
    reportId: string;
    selectedCompany: string | null;
  };
};
