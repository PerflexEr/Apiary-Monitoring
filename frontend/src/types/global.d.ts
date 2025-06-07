declare module 'mobx-react-lite' {
  import React from 'react';

  export function observer<P extends object>(
    component: React.ComponentType<P>
  ): React.ComponentType<P>;

  export function observer<T extends React.ComponentType<any>>(
    target: T
  ): T;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const content: any;
  export default content;
}