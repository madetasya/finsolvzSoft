export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  SearchPage: undefined;
  CreateReport: undefined;
  ClientHomePage: undefined;
  BSPLPage: { reportId: string; companyId: string; reportType: string }
  Revenue: {
    reportId: string;
    selectedCompany: string | null;
  };
};
