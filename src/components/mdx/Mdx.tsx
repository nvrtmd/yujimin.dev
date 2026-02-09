import parse, { Element, domToReact, DOMNode } from 'html-react-parser';
import { CodeBlock } from './CodeBlock';

interface MdxProps {
  code: string;
}

export function Mdx({ code }: MdxProps) {
  const parsedContent = parse(code, {
    replace(domNode) {
      if (
        domNode instanceof Element &&
        domNode.type === 'tag' &&
        domNode.name === 'pre'
      ) {
        return (
          <CodeBlock>{domToReact(domNode.children as DOMNode[])}</CodeBlock>
        );
      }
    },
  });

  return (
    <div
      className='prose prose-lg max-w-none font-sans text-black
      prose-headings:font-sans prose-headings:font-bold
      prose-p:font-sans
      prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
      prose-a:text-[var(--color-link)] prose-a:underline hover:prose-a:bg-[var(--color-window-title-active)] hover:prose-a:text-white prose-a:cursor-pointer
      prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-border-dark)] prose-blockquote:bg-gray-100 prose-blockquote:not-italic
      prose-img:border-2 prose-img:border-[var(--color-border-dark)] prose-img:border-b-white prose-img:border-r-white'
    >
      {parsedContent}
    </div>
  );
}
