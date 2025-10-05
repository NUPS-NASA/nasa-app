import LightCurveChart, { LightCurveSeries } from '../../../../src/shared/ui/LightCurveChart';
const dummySeries: LightCurveSeries[] = [
  {
    id: 'star-1',
    name: 'Betelgeuse',
    description: '붉은 초거성으로, 광도가 불규칙하게 변함.',
    points: Array.from({ length: 30 }, (_, i) => ({
      x: i,
      y: 1 + Math.sin(i / 2) * 0.2 + Math.random() * 0.05,
    })),
  },
  {
    id: 'star-2',
    name: 'Sirius',
    description: '가장 밝은 별로, 주기적인 광도 변화를 보임.',
    points: Array.from({ length: 30 }, (_, i) => ({
      x: i,
      y: 0.9 + Math.sin(i / 3 + 1) * 0.1 + Math.random() * 0.03,
    })),
  },
  {
    id: 'star-3',
    name: 'Rigel',
    description: '청백색 초거성으로, 약한 변광 특성을 보임.',
    points: Array.from({ length: 30 }, (_, i) => ({
      x: i,
      y: 1.2 + Math.cos(i / 4) * 0.05 + Math.random() * 0.02,
    })),
  },
  {
    id: 'star-4',
    name: 'Polaris',
    description: '세페이드 변광성으로, 비교적 일정한 주기 변화를 가짐.',
    points: Array.from({ length: 30 }, (_, i) => ({
      x: i,
      y: 1 + Math.sin(i / 5) * 0.15 + Math.random() * 0.02,
    })),
  },
];

const ResultAnal: React.FC = () => {
  return (
    <div>
      <LightCurveChart series={dummySeries}></LightCurveChart>
    </div>
  );
};

export default ResultAnal;
