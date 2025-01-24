import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface HospitalData {
  [key: string]: number | string;
}

interface HospitalGroup {
  全院: HospitalData;
  本部: HospitalData;
  常营院区: HospitalData;
  石景山院区: HospitalData;
}

type HospitalKey = keyof HospitalGroup;

interface DataRecord {
  日期: string;
  医院数据: HospitalGroup;
}

interface ChartProps {
  selectedDate: string;
  selectedMetric: string;
  chartType: 'line' | 'bar' | 'pie';
  selectedHospitals: HospitalKey[];
  allData: DataRecord[];
}

const Chart: React.FC<ChartProps> = ({
  selectedDate,
  selectedMetric,
  chartType,
  selectedHospitals,
  allData,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !chartRef.current ||
      !selectedDate ||
      !selectedMetric ||
      allData.length === 0
    )
      return;

    const dataRecord = allData.find((item) => item.日期 === selectedDate);
    if (!dataRecord) return;

    const seriesData: { name: string; value: number }[] = [];
    selectedHospitals.forEach((hos) => {
      const rawValue = dataRecord.医院数据[hos]?.[selectedMetric];
      let numericValue = parseFloat(rawValue as string);
      if (isNaN(numericValue)) numericValue = 0;
      seriesData.push({ name: hos, value: numericValue });
    });

    const newChartInstance = echarts.init(chartRef.current);

    const getLegendOption = (): echarts.LegendComponentOption => {
      const isSmallScreen = window.innerWidth < 768;
      return isSmallScreen
        ? {
            orient: 'horizontal',
            bottom: 0,
            left: 'center',
          }
        : {
            orient: 'vertical',
            left: 'left',
          };
    };

    let option: echarts.EChartsOption;

    if (chartType === 'pie') {
      option = {
        title: {
          text: `${selectedMetric}（${selectedDate}）`,
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
        },
        legend: getLegendOption(),
        series: [
          {
            name: selectedMetric,
            type: 'pie',
            radius: '50%',
            data: seriesData.map((item) => ({
              name: item.name,
              value: item.value,
            })),
            label: {
              show: true,
              formatter: '{b}: {c} ({d}%)',
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      };
    } else {
      option = {
        title: {
          text: `${selectedMetric}（${selectedDate}）`,
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: getLegendOption(),
        xAxis: {
          type: 'category',
          data: seriesData.map((item) => item.name),
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: selectedMetric,
            type: chartType,
            data: seriesData.map((item) => item.value),
            label: {
              show: true,
              position: 'top',
              formatter: '{c}',
            },
          },
        ],
      };
    }

    newChartInstance.setOption(option);

    function handleResize() {
      newChartInstance.resize();
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      newChartInstance.dispose();
    };
  }, [
    chartRef,
    selectedDate,
    selectedMetric,
    chartType,
    selectedHospitals,
    allData,
  ]);

  return <div className="chart-wrapper" ref={chartRef} />;
};

export default Chart;
