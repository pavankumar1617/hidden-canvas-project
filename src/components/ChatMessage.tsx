
import React from 'react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const formatText = (text: string) => {
    return text.split('\n').map((line, index, array) => (
      <span key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className={cn('flex', message.isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'rounded-lg p-3 max-w-[80%] text-sm',
          message.isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {formatText(message.text)}
      </div>
    </div>
  );
}
