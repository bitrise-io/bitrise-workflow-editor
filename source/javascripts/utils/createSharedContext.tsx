// from https://github.com/seahorsepip/react2angular-shared-context
/*
	Copyright (c) 2022 Thomas Gladdines

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/
import { ComponentProps, ComponentType, Fragment, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface SharedContextComponent<Props = object> {
  key: string;
  node: HTMLElement;
  component: ComponentType<Props>;
  props: Props;
}

interface SharedComponentInstance<T> {
  update: (props: T) => void;
  remove: () => void;
}

type RenderMethod = {
  <T extends object>(component: SharedContextComponent<T>): SharedComponentInstance<T>;
};

type SharedContextReturn<Root extends object> = {
  component: (root: Root) => JSX.Element;
  use<Props extends object>(c: ComponentType<Props>): (props: Props) => JSX.Element;
};

const createSharedContext = <R extends object>(Root: ComponentType<R> = Fragment): SharedContextReturn<R> => {
  // Make method accessible by both SharedContext and withSharedContext
  let renderWithSharedContext: RenderMethod;

  const SharedContext = (rootProps: R): JSX.Element => {
    // List of components and their props to be rendered with react portal in their designated nodes
    const [components, setComponents] = useState<Array<SharedContextComponent | undefined>>([]);

    useEffect(() => {
      renderWithSharedContext = <T extends object>(
        component: SharedContextComponent<T>,
      ): SharedComponentInstance<T> => {
        // Add component to list
        setComponents((prevState) => {
          prevState.push(component as unknown as SharedContextComponent<object>);
          return [...prevState];
        });

        // Return callbacks to update and remove component from list
        return {
          update: (props) => {
            setComponents((prevState) => {
              const prevComponent = prevState.find((c) => c?.key === component.key);
              if (!prevComponent) {
                return prevState;
              }
              prevComponent.props = props;
              return [...prevState];
            });
          },
          remove: () => {
            setComponents((prevState) => {
              const index = prevState.findIndex((c) => c?.key === component.key);
              if (index === -1) {
                return prevState;
              }
              // eslint-disable-next-line no-param-reassign
              prevState[index] = undefined;
              return [...prevState];
            });
          },
        };
      };
    }, []);

    // Return list of react portals wrapped in one or multiple providers
    return (
      <Root {...rootProps}>
        {components.map((component) => {
          if (!component) {
            return null;
          }
          const { key, node, component: C, props } = component;
          return createPortal(<C key={key} {...props} />, node);
        })}
      </Root>
    );
  };

  const useSharedContext: {
    <T extends object>(component: ComponentType<T>): (p: T) => JSX.Element;
  } = (component) => {
    // Create as local variable instead of returning inline to fix TSLint
    const UseSharedContext = (props: ComponentProps<typeof component>): JSX.Element => {
      // Create unique key for this instance
      const key = useId();
      // Hold reference to rendered hidden DOM node
      const ref = useRef<HTMLDivElement>(null);
      // Instance is SharedContext
      const instance = useRef<SharedComponentInstance<ComponentProps<typeof component>>>();

      useEffect(() => {
        if (instance.current) {
          // Pass prop updates to instance in SharedContext
          instance.current.update(props);
        }
      }, [props]);

      useEffect(() => {
        if (ref.current && ref.current.parentElement) {
          // Create instance in SharedContext
          instance.current = renderWithSharedContext({
            key,
            node: ref.current.parentElement,
            component,
            props,
          });

          // Return callback to unmount component in SharedContext when this component is unmounted
          return instance.current.remove;
        }

        return undefined;
      }, [key, props]);

      // Hidden <div> component only used to get reference in dom
      return <div ref={ref} style={{ display: 'none' }} />;
    };

    return UseSharedContext;
  };

  return {
    component: SharedContext,
    use: useSharedContext,
  };
};

export default createSharedContext;
