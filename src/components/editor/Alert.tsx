import './styles/Alert.pcss';

type Props = {
  message?: string;
};

export const Alert = ({ message }: Props) =>
  message ? (
    <div styleName="base">
      <div styleName="icon">🤷‍</div>
      <div styleName="message">{message}</div>
    </div>
  ) : null;
