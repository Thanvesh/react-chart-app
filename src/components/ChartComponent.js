import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import { useSpring, animated } from 'react-spring';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './ChartComponent.css'; // Import a CSS file for additional styles

function ChartComponent() {
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState('daily');
  const [zoomed, setZoomed] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipData, setTooltipData] = useState({});
  const [animation, setAnimation] = useSpring(() => ({
    opacity: 0,
    x: 0,
  }));
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);
  const chartRef = useRef(null);
  const [zoomRange, setZoomRange] = useState([0, 100]);

  useEffect(() => {
    fetch('data.json')
      .then(response => response.json())
      .then(data => setData(data));
  }, []);

  useEffect(() => {
    setAnimation({
      opacity: 1,
      x: 0,
    });
  }, [setAnimation]);

  const handleSliderChange = (range) => {
    setZoomRange(range);
  };

  const handleTimeframeChange = event => {
    setTimeframe(event.target.value);
  };

  const handleChartClick = event => {
    setTooltipOpen(!tooltipOpen);
    setTooltipData({
      x: event.activeLabel,
      y: event.activePayload?.[0]?.value ?? 'No value',
    });
  };

  const handleZoom = () => {
    setZoomed(!zoomed);
  };

  const handleExport = () => {
    html2canvas(chartRef.current).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'chart.png';
      link.click();
    });
  };

  const handleMinValueChange = event => {
    setMinValue(parseInt(event.target.value, 10));
  };

  const handleMaxValueChange = event => {
    setMaxValue(parseInt(event.target.value, 10));
  };

  const filteredData = data.filter(item => {
    const date = new Date(item.timestamp);
    const withinTimeframe =
      timeframe === 'daily'
        ? date >= new Date(date.setDate(date.getDate() - 1))
        : timeframe === 'weekly'
          ? date >= new Date(date.setDate(date.getDate() - 7))
          : timeframe === 'monthly'
            ? date >= new Date(date.setMonth(date.getMonth() - 1))
            : true;

    const withinValueRange = item.value >= minValue && item.value <= maxValue;
    return withinTimeframe && withinValueRange;
  }).slice(zoomRange[0], zoomRange[1]);

  const determineInterval = () => {
    const rangePercentage = (zoomRange[1] - zoomRange[0]) / 100;
    if (!zoomed) {
      if (timeframe === 'weekly' || timeframe === 'monthly') {
        return 0;
      }
    }
     if (timeframe === 'daily') {
      return 0;
    } else if (timeframe === 'weekly') {
      if (rangePercentage >= 0.1 && rangePercentage < 0.2) {
        return 1;
      } else if (rangePercentage >= 0.2 && rangePercentage < 0.3) {
        return 3;
      } else if (rangePercentage >= 0.4 && rangePercentage < 0.7) {
        return 4;
      } else if (rangePercentage >= 0.7 && rangePercentage<0.8) {
        return 5;
      } else {
        return 1;
      }
    } else if (timeframe === 'monthly') {
      if (rangePercentage >= 0.2 && rangePercentage < 0.3) {
        return 0;
      } else if (rangePercentage >= 0.3 && rangePercentage < 0.4) {
        return 3;
      } else if (rangePercentage >= 0.4 && rangePercentage < 0.5) {
        return 14;
      } else if (rangePercentage >= 0.5 && rangePercentage < 0.6) {
        return 21;
      } else if (rangePercentage >= 0.6 && rangePercentage <0.8) {
        return 30;
      } else {
        return 1;
      }
    }
  };

  const generateMessage = () => {
  const rangePercentage = (zoomRange[1] - zoomRange[0]) / 100;

  if (zoomed) {
    switch (timeframe) {
      case 'daily':
        return 'Zoomed: Displaying daily data';
      case 'weekly':
        if (rangePercentage >= 0.1 && rangePercentage < 0.2) {
          return 'Zoomed: Displaying data grouped by 1 day';
        } else if (rangePercentage >= 0.2 && rangePercentage < 0.3) {
          return 'Zoomed: Displaying data grouped by 3 days';
        } else if (rangePercentage >= 0.3 && rangePercentage < 0.6) {
          return 'Zoomed: Displaying data grouped by 4 days';
        } else if (rangePercentage >= 0.6) {
          return 'Zoomed: Displaying data grouped by 5 days';
        } else {
          return 'Zoomed: Displaying weekly data';
        }
      case 'monthly':
        if (rangePercentage >= 0.1 && rangePercentage < 0.2) {
          return 'Zoomed: Displaying data grouped by 1 day';
        } else if (rangePercentage >= 0.2 && rangePercentage < 0.3) {
          return 'Zoomed: Displaying data grouped by 3 days';
        } else if (rangePercentage >= 0.3 && rangePercentage < 0.5) {
          return 'Zoomed: Displaying data grouped by 2 weeks';
        } else if (rangePercentage >= 0.5 && rangePercentage < 0.7) {
          return 'Zoomed: Displaying data grouped by 3 weeks';
        } else if (rangePercentage >= 0.7) {
          return 'Zoomed: Displaying data grouped by 4 weeks';
        } else {
          return 'Zoomed: Displaying monthly data';
        }
      default:
        return 'Zoomed: Displaying data';
    }
  } else {
    switch (timeframe) {
      case 'daily':
        return 'Displaying daily data';
      case 'weekly':
        if (rangePercentage >= 0.1 && rangePercentage < 0.2) {
          return 'Displaying data grouped by 1 day';
        } else if (rangePercentage >= 0.2 && rangePercentage < 0.3) {
          return 'Displaying data grouped by 3 days';
        } else if (rangePercentage >= 0.3 && rangePercentage < 0.6) {
          return 'Displaying data grouped by 4 days';
        } else if (rangePercentage >= 0.6) {
          return 'Displaying data grouped by 5 days';
        } else {
          return 'Displaying weekly data';
        }
      case 'monthly':
        if (rangePercentage >= 0.1 && rangePercentage < 0.2) {
          return 'Displaying data grouped by 1 day';
        } else if (rangePercentage >= 0.2 && rangePercentage < 0.3) {
          return 'Displaying data grouped by 3 days';
        } else if (rangePercentage >= 0.3 && rangePercentage < 0.5) {
          return 'Displaying data grouped by 2 weeks';
        } else if (rangePercentage >= 0.5 && rangePercentage < 0.7) {
          return 'Displaying data grouped by 3 weeks';
        } else if (rangePercentage >= 0.7) {
          return 'Displaying data grouped by 4 weeks';
        } else {
          return 'Displaying monthly data';
        }
      default:
        return 'Displaying data';
    }
  }
};


  const groupDataByPeriod = (data, period) => {
    const groupedData = [];
    let periodStart = null;
    let periodEnd = null;

    data.forEach((item, index) => {
      const date = new Date(item.timestamp);
      const isNewPeriod =
        (period === 'weekly' && date.getDay() === 0) ||
        (period === 'monthly' && date.getDate() === 1);

      if (isNewPeriod) {
        if (periodStart && periodEnd) {
          groupedData.push(periodStart);
          groupedData.push(periodEnd);
        }
        periodStart = item;
      }

      periodEnd = item;

      if (index === data.length - 1 && periodStart && periodEnd) {
        groupedData.push(periodStart);
        groupedData.push(periodEnd);
      }
    });

    return groupedData;
  };

  const reducedData = timeframe === 'daily' ? filteredData : groupDataByPeriod(filteredData, timeframe);

  const getReducedData = () => {
    if (zoomed) {
      return filteredData.slice(zoomRange[0], zoomRange[1]);
    } else {
      return reducedData;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    switch (timeframe) {
      case 'daily':
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
      case 'weekly':
        return `${date.toLocaleString('default', { month: 'short' })} - Week ${getISOWeek(date)} - ${date.getFullYear()}`;
      case 'monthly':
        return `${date.toLocaleString('default', { month: 'short' })}, ${date.getFullYear()}`;
      default:
        return '';
    }
  };

  const getISOWeek = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  };

  return (
    <animated.div className="chart-container" style={{
      opacity: animation.opacity,
      transform: `translateX(${animation.x}px)`,
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <div className="controls">
        <select className="timeframe-selector" value={timeframe} onChange={handleTimeframeChange}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button className="zoom-button" onClick={handleZoom}>{zoomed ? 'Unzoom' : 'Zoom'}</button>
        <button className="export-button" onClick={handleExport}>Export Chart</button>
      </div>
      <div className="value-controls">
        <div>
          <label>Min Value:</label>
          <input className="value-input" type="number" value={minValue} onChange={handleMinValueChange} />
        </div>
        <div>
          <label>Max Value:</label>
          <input className="value-input" type="number" value={maxValue} onChange={handleMaxValueChange} />
        </div>
      </div>
      {zoomed && (
        <div className="slider-container">
          <label>Zoom Range:</label>
          <Slider
            range
            min={0}
            max={data.length}
            value={zoomRange}
            onChange={handleSliderChange}
          />
        </div>
      )}
      <div className="chart-container-two">
  <ResponsiveContainer className="new-container" ref={chartRef} width="100%" height={400}>
    <BarChart id="chart" data={getReducedData()} onClick={handleChartClick} ref={chartRef}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="timestamp"
        tickFormatter={formatTimestamp}
        interval={determineInterval()}
        height={120}
        tick={{ angle: -45, textAnchor: 'end', style: { fontWeight: 'bold', fontSize: "9px", marginRight: "12px" } }}
      />
      <YAxis
        tick={{ style: { fontWeight: 'bold' } }}
      />
      <Tooltip />
      <Bar
        dataKey="value"
        barSize={30}
        background={{ fill: '#eee' }}
        shape={<rect className="custom-bar custom-bar-3d" />}
        onClick={handleChartClick}
      />
    </BarChart>
  </ResponsiveContainer>
</div>

      <div className="message-container">
        <p>{generateMessage()}</p>
      </div>

      {tooltipOpen && (
        <div className="tooltip-modal">
          <div className="tooltip-content">
            <p>x: {tooltipData.x}</p>
            <p>y: {tooltipData.y}</p>
          </div>
        </div>
      )}
    </animated.div>
  );
}

export default ChartComponent;
