'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ListingFormData = {
  title: string;
  city: string;
  district: string;
  address: string;
  type: string;
  area: number;
  rooms: number;

  price: number;
  onlinePayment: boolean;
  useInsurance: boolean;
  deposit: number;
  rentDuration: string;
  availableFrom: Date | null;
  allowPets: boolean;
  allowKids: boolean;
  allowSmoking: boolean;

  description: string;
  amenities: string[];

  photos: File[];

  // 🧑‍💼 Данные владельца
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerRating: number;
};

const defaultData: ListingFormData = {
  title: '',
  city: '',
  district: '',
  address: '',
  type: '',
  area: 0,
  rooms: 1,

  price: 0,
  onlinePayment: false,
  useInsurance: false,
  deposit: 0,
  rentDuration: '',
  availableFrom: null,
  allowPets: false,
  allowKids: false,
  allowSmoking: false,

  description: '',
  amenities: [],

  photos: [],

  // 🧑‍💼 Владелец по умолчанию
  ownerId: '',
  ownerName: '',
  ownerAvatar: '',
  ownerRating: 5, // можно задать стартовый рейтинг
};

type ListingFormContextType = {
  data: ListingFormData;
  updateData: (newData: Partial<ListingFormData>) => void;
  resetData: () => void;
};

const ListingFormContext = createContext<ListingFormContextType | undefined>(undefined);

export const useListingForm = () => {
  const context = useContext(ListingFormContext);
  if (!context) throw new Error('useListingForm must be used within a ListingFormProvider');
  return context;
};

export const ListingFormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ListingFormData>(defaultData);

  const updateData = (newData: Partial<ListingFormData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const resetData = () => {
    setData(defaultData);
  };

  return (
    <ListingFormContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </ListingFormContext.Provider>
  );
};
