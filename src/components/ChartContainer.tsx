import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { DatePicker, Select, Checkbox, Row, Col } from 'antd';
import dayjs from 'dayjs';
import useChart from '../hooks/useChart';

interface HospitalData {
  [key: string]: number | string;
}

interface HospitalGroup {
  全院: HospitalData;
  本部: HospitalData;
  常营院区: HospitalData;
  石景山院区: HospitalData;
}

interface DataRecord {
  日期: string;
  医院数据: HospitalGroup;
}

export default function ChartContainer() {
  const chartRef = useRef<HTMLDivElement>(null);

  const [allData, setAllData] = useState<DataRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [chartType, setChartType] = useState<string>('line');
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([
    '全院',
    '本部',
    '常营院区',
    '石景山院区',
  ]);
  const [metricsOptions, setMetricsOptions] = useState<string[]>([]);

  useChart({
    chartRef,
    selectedDate,
    selectedMetric,
    chartType,
    selectedHospitals,
    allData,
  });

  // 获取 data.json
  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.json())
      .then((jsonData) => {
        const rawData: DataRecord[] = jsonData?.['数据记录'] ?? [];
        setAllData(rawData);

        // 假设第一条数据的"医院数据.全院"里有我们想要的所有指标
        if (rawData.length > 0) {
          const sampleKeys = Object.keys(rawData[0].医院数据.全院);
          setMetricsOptions(
            sampleKeys.filter((key) => key !== '当月截止总收入')
          );
          // 默认为第一个指标
          setSelectedMetric(sampleKeys[0]);
        }
        // 默认为第一条数据的日期
        if (rawData.length > 0) {
          setSelectedDate(rawData[0].日期);
        }
      })
      .catch((err) => {
        console.error('获取 data.json 失败：', err);
      });
  }, []);

  // 处理日期改变
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date.format('YYYY-MM-DD'));
    }
  };

  // 处理数据分类改变
  const handleMetricChange = (value: string) => {
    setSelectedMetric(value);
  };

  // 处理图表类型改变
  const handleChartTypeChange = (value: string) => {
    setChartType(value);
  };

  // 处理医院区域多选
  const handleHospitalChange = (checkedValues: any[]) => {
    setSelectedHospitals(checkedValues as string[]);
  };

  // 获取所有已存在的日期，用于 DatePicker 的选择
  const dateOptions = allData.map((item) => item.日期);

  return (
    <div className="chart-container">
      <div className="controls">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <DatePicker
              placeholder="选择日期"
              value={selectedDate ? dayjs(selectedDate) : null}
              onChange={handleDateChange}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              className="full-width-select"
              placeholder="选择数据分类"
              options={metricsOptions.map((metric) => ({
                label: metric,
                value: metric,
              }))}
              value={selectedMetric}
              onChange={handleMetricChange}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              className="full-width-select"
              placeholder="图表类型"
              options={[
                { label: '折线图', value: 'line' },
                { label: '柱状图', value: 'bar' },
                { label: '饼图', value: 'pie' },
              ]}
              value={chartType}
              onChange={handleChartTypeChange}
            />
          </Col>
        </Row>

        <Checkbox.Group
          options={['全院', '本部', '常营院区', '石景山院区']}
          value={selectedHospitals}
          onChange={handleHospitalChange}
        />
      </div>
      <div className="chart-wrapper" ref={chartRef} />
    </div>
  );
}
