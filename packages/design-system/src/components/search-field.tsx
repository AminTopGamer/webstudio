import {
  type ComponentProps,
  type ForwardRefRenderFunction,
  forwardRef,
  useRef,
  useState,
  useEffect,
  type ChangeEventHandler,
  type KeyboardEventHandler,
  type FormEventHandler,
} from "react";
import { XCircledFilledIcon, SearchIcon } from "@webstudio-is/icons";
import { styled } from "../stitches.config";
import { theme } from "../stitches.config";
import { InputField } from "./input-field";
import { SmallIconButton } from "./small-icon-button";
import { Flex } from "./flex";
import { mergeRefs } from "@react-aria/utils";

const SearchIconStyled = styled(SearchIcon, {
  // need to center icon vertically
  display: "block",
  color: theme.colors.foregroundSubtle,
  padding: theme.spacing[3],
});

const AbortButton = styled(SmallIconButton, {
  variants: {
    hidden: {
      false: { visibility: "hidden" },
      true: {},
    },
  },
});

const SearchFieldBase: ForwardRefRenderFunction<
  HTMLInputElement,
  ComponentProps<typeof InputField> & { onAbort?: () => void }
> = (props, ref) => {
  const {
    onChange,
    onAbort,
    value: propsValue = "",
    onKeyDown,
    ...rest
  } = props;
  const [value, setValue] = useState(String(propsValue));
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setValue(String(propsValue));
  }, [propsValue]);
  const handleCancel = () => {
    setValue("");
    onAbort?.();
  };
  return (
    <InputField
      {...rest}
      ref={ref}
      // search field implements own reset button
      // type=search does not work here because
      // brings native reset button
      type="text"
      value={value}
      inputRef={mergeRefs(inputRef, rest.inputRef)}
      prefix={<SearchIconStyled />}
      suffix={
        <Flex align="center" css={{ padding: theme.spacing[2] }}>
          <AbortButton
            hidden={value.length > 0 ? "true" : "false"}
            aria-label="Reset search"
            title="Reset search"
            tabIndex={-1}
            onClick={() => {
              handleCancel();
            }}
            icon={<XCircledFilledIcon />}
          />
        </Flex>
      }
      onChange={(event) => {
        setValue(event.target.value);
        onChange?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && value.length !== 0) {
          event.preventDefault();
          handleCancel();
        }
        onKeyDown?.(event);
      }}
    />
  );
};

export const SearchField = forwardRef(SearchFieldBase);

type UseSearchFieldKeys = {
  onMove: (event: { direction: "next" | "previous" | "current" }) => void;
  onChange?: FormEventHandler<HTMLInputElement>;
  onAbort?: () => void;
};

export const useSearchFieldKeys = ({
  onMove,
  onChange,
  onAbort,
}: UseSearchFieldKeys) => {
  const [search, setSearch] = useState("");
  const handleKeyDown: KeyboardEventHandler = ({ code }) => {
    const keyMap = {
      ArrowUp: "previous",
      ArrowDown: "next",
      Enter: "current",
    } as const;
    const direction = keyMap[code as keyof typeof keyMap];
    if (direction !== undefined) {
      onMove({ direction });
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.currentTarget;
    setSearch(value.trim());
    onChange?.(event);
  };

  const handleCancel = () => {
    setSearch("");
    onAbort?.();
  };

  return {
    value: search,
    onAbort: handleCancel,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
  };
};
