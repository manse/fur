import './styles/SimuationProgress.pcss';

type Props = {
  progress: number;
  size?: 'small';
};

export const SimulationProgress = ({ progress, size }: Props) => (
  <div styleName={`base ${size || ''}`}>{`${Math.round(progress * 10000) / 100 + 0.00001}`.substr(0, 5)}</div>
);
