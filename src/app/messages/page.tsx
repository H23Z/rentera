'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/firebase/firebase';
import { useAuth } from '@/hooks/useAuth';

// Динамическая загрузка компонента, который использует useRouter
import dynamic from 'next/dynamic';

interface ChatWindowProps {
  otherUserId: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  onBack?: () => void; // функция для возврата назад
}

// Динамически загружаем компоненты, которые используют useRouter
const ChatList = dynamic(() => import('@/app/components/chat/ChatList'), { ssr: false });
const ChatWindow = dynamic<ChatWindowProps>(
  () =>
    import('@/app/components/chat/ChatWindow')
      .then((mod) => mod.ChatWindow),
  {
    ssr: false,
    loading: () => <div className="p-4 text-center">Загрузка чата…</div>,
  }
);

export default function MessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false); // Проверка на клиентский рендеринг

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [selectedUserAvatar, setSelectedUserAvatar] = useState<string>('');

  // Используем useEffect для проверки того, что компонент уже смонтирован
  useEffect(() => {
    setIsClient(true); // После монтирования компонента включаем клиентский рендер
  }, []);

  // Открытие чата по query параметру userId
  useEffect(() => {
    const targetUserId = new URLSearchParams(window.location.search).get('userId');
    if (targetUserId && user?.uid && targetUserId !== user.uid) {
      setSelectedUserId(targetUserId);
    }
  }, [user?.uid]);

  // Проверяем, существует ли чат
  useEffect(() => {
    const ensureChat = async () => {
      if (!user?.uid || !selectedUserId) return;
      const chatId = [user.uid, selectedUserId].sort().join('_');
      const ref = doc(db, 'chats', chatId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          participants: [user.uid, selectedUserId],
          lastMessage: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    };
    ensureChat();
  }, [selectedUserId, user?.uid]);

  if (!isClient) {
    return <div>Loading...</div>; // Пока не смонтирован, показываем "Загрузка..."
  }

  return (
    <div className="flex flex-col md:flex-row h-[90vh]">
      {/* Список чатов */}
      <div
        className={`${
          selectedUserId ? 'hidden' : 'block'
        } w-full md:block md:w-1/3 bg-background overflow-auto`}
      >
        <ChatList
          selectedUserId={selectedUserId}
          onSelect={(id, name, avatar) => {
            setSelectedUserId(id);
            setSelectedUserName(name || '');
            setSelectedUserAvatar(avatar || '');
          }}
        />
      </div>

      {/* Окно чата */}
      <div
        className={`${
          selectedUserId ? 'block' : 'hidden'
        } w-full md:block md:flex-1 bg-background`}
      >
        {selectedUserId ? (
          <ChatWindow
            otherUserId={selectedUserId}
            otherUserName={selectedUserName}
            otherUserAvatar={selectedUserAvatar}
            onBack={() => setSelectedUserId(null)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-base px-4">
            {t('messages.selectChat', 'Выберите чат, чтобы начать общение')}
          </div>
        )}
      </div>
    </div>
  );
}
