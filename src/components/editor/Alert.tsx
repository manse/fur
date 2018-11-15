import './styles/Alert.pcss';

type Props = {
  message?: string;
};

export const Alert = ({ message }: Props) => (message ? <div styleName="base">{message}</div> : null);
