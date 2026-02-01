import styles from './LabeledInput.module.scss'

export interface LabeledInputProps {
  id: string,
  labelText?: string,
  children?: React.ReactNode,
  inputProps?: React.HTMLProps<HTMLInputElement>,
  otherProps?: Record<string, unknown>,
  customInputElement?: React.ReactElement,
}
export const LabeledInput = ({
  id,
  labelText,
  children,
  customInputElement,
  inputProps = {},
  otherProps = {},
}: LabeledInputProps): React.ReactElement  => {
  return (
    <label
      htmlFor={id}
      className={styles.labeledInput}
      {...otherProps}
    >
      {labelText && <span>{labelText}</span>}
      {children}
      {!customInputElement && (
        <input
          id={id}
          name={id}
          {...inputProps}
        />
      )}
      {customInputElement}
    </label>
  )
}

export default LabeledInput