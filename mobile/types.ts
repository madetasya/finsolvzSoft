export type RootStackParamList = {
  Login: undefined;
  HomePage: {
    openModal?: boolean;
    selectedUser?: any;
    openCompanyModal?: boolean;
    selectedCompany?: any;
  } | undefined;

  SearchPage: undefined;
  CreateReport: undefined;
  ClientHomePage: undefined;
  BSPLPage: { reportId: string; companyId: string; reportType: string }
  Revenue: {
    reportId: string;
    selectedCompany: string | null;
  };
};
