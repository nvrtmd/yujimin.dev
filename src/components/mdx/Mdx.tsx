import * as runtime from 'react/jsx-runtime';
import Image from 'next/image';
import { HTMLAttributes, HTMLProps } from 'react';
import { CodeBlock } from './CodeBlock';
import { Details } from './Details';
import { TOC } from './TOC';

const EXTERNAL_LINK_PREFIX = 'http';

interface MdxProps {
  code: string;
}

const components = {
  Image,
  pre: (props: HTMLAttributes<HTMLPreElement>) => <CodeBlock {...props} />,
  Details: Details,
  a: ({ href, children }: HTMLProps<HTMLAnchorElement>) => {
    const isExternal = href && href.startsWith(EXTERNAL_LINK_PREFIX);
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className='text-[var(--color-link)] underline hover:bg-[var(--color-window-title-active)] hover:text-white cursor-pointer'
      >
        {children}
      </a>
    );
  },
  TOC: TOC,
};

const useMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code);

  return (
    <div
      className='prose prose-lg max-w-none font-sans text-black
      prose-headings:font-sans prose-headings:font-bold
      prose-p:font-sans
      prose-pre:m-0 prose-pre:bg-transparent prose-pre:text-sm
      prose-code:text-sm
      prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-border-dark)] prose-blockquote:bg-gray-100 prose-blockquote:not-italic
      prose-img:border-2 prose-img:border-[var(--color-border-dark)] prose-img:border-b-white prose-img:border-r-white'
    >
      <Component components={components} />
    </div>
  );
}
