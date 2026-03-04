interface Window {
  setUser: (user: {
    phone: string;
    password: string;
    categoryId: number;
    provideUserId?: number;
    provideCategoryId?: number;
  }) => void;
  getUser: () => any;
  removeUser: () => void;
}
