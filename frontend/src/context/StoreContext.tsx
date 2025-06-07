import { createContext } from 'react';
import { RootStore } from '../stores/RootStore';

export const rootStore = new RootStore();
export const StoreContext = createContext<RootStore | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
}; 