import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  Legend,
  TooltipProps
} from 'recharts';
import { format, startOfHour, endOfHour, addMinutes, isWithinInterval, min, max, subMinutes } from 'date-fns';

interface LogData {
  timestamp: Date;
  message: string;
  file: string;
  level: 'ERR' | 'WARN';
}

interface TimelineProps {
  logData: LogData[];
  selectedError: string | null;
}

interface ChartDataPoint {
  timestamp: Date;
  count: number;
  entries?: LogData[];
}

interface ScatterDataPoint extends ChartDataPoint {
  file: string;
  intervalCount: number;
}

const Timeline: React.FC<TimelineProps> = ({ logData, selectedError }) => {
  const theme = useTheme();

  // Calculate the date range once
  const { startDate, endDate } = useMemo(() => {
    if (!logData.length) return { startDate: new Date(), endDate: new Date() };

    const dates = logData.map(log => log.timestamp);
    const minDate = min(dates);
    const maxDate = max(dates);

    // Round to hours and add padding
    return {
      startDate: subMinutes(startOfHour(minDate), 30),
      endDate: addMinutes(endOfHour(maxDate), 30)
    };
  }, [logData]);

  // Process data for the chart
  const chartData = useMemo(() => {
    if (!logData.length) return [];

    console.log('Processing timeline data:', logData);

    // Filter data if an error is selected
    const filteredData = selectedError
      ? logData.filter(log => log.message === selectedError)
      : logData;

    console.log('Date range:', { startDate, endDate });

    // Create 15-minute intervals for better granularity
    const intervals: ChartDataPoint[] = [];
    let currentInterval = startDate;

    while (currentInterval <= endDate) {
      intervals.push({
        timestamp: new Date(currentInterval),
        count: 0,
        entries: []
      });
      currentInterval = addMinutes(currentInterval, 15);
    }

    // Count occurrences and collect entries for each interval
    filteredData.forEach(log => {
      const interval = intervals.find(i => 
        isWithinInterval(log.timestamp, {
          start: i.timestamp,
          end: addMinutes(i.timestamp, 15)
        })
      );
      if (interval) {
        interval.count++;
        interval.entries?.push(log);
      }
    });

    console.log('Processed intervals:', intervals);
    return intervals;
  }, [logData, selectedError, startDate, endDate]);

  const formatXAxis = (date: Date) => {
    return format(date, 'MMM d HH:mm');
  };

  const formatTooltip = (date: Date) => {
    return format(date, 'MMMM d, yyyy HH:mm');
  };

  const renderTooltip = (props: TooltipProps<number, string>) => {
    if (!props.active || !props.payload || props.payload.length === 0) {
      return null;
    }

    const data = props.payload[0].payload as ChartDataPoint | ScatterDataPoint;
    const isScatterPoint = 'file' in data;

    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="body2">
          {formatTooltip(data.timestamp)}
        </Typography>
        {isScatterPoint ? (
          <>
            <Typography variant="body2">
              File: {data.file}
            </Typography>
            <Typography variant="body2">
              Time: {format(data.timestamp, 'HH:mm:ss')}
            </Typography>
            <Typography variant="body2">
              Interval Count: {data.intervalCount}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body2">
              Count: {data.count}
            </Typography>
            {data.entries && data.entries.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {data.entries[0].level === 'ERR' ? 'Errors' : 'Warnings'} in this interval:
                </Typography>
                {data.entries.map((entry: LogData, index: number) => (
                  <Typography key={index} variant="caption" display="block">
                    {format(entry.timestamp, 'HH:mm:ss')} - {entry.message.split('\n')[0]}
                  </Typography>
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    );
  };

  // Create scatter plot data with interval counts
  const scatterData = useMemo(() => {
    if (!selectedError) return [];
    
    return chartData.flatMap(interval => 
      (interval.entries || []).map(entry => ({
        timestamp: entry.timestamp,
        count: interval.count,
        intervalCount: interval.count,
        file: entry.file
      }))
    );
  }, [chartData, selectedError]);

  // Calculate Y-axis domain
  const yAxisDomain = useMemo(() => {
    const maxCount = Math.max(...chartData.map(d => d.count));
    return [0, Math.max(maxCount, 1)];
  }, [chartData]);

  const getTitle = () => {
    if (!logData.length) return 'Timeline';
    return `${logData[0].level === 'ERR' ? 'Error' : 'Warning'} Timeline`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {getTitle()}
      </Typography>
      
      <Box sx={{ height: 400, width: '100%' }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 16,
              right: 16,
              bottom: 24,
              left: 24,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              domain={[startDate.getTime(), endDate.getTime()]}
              type="number"
              scale="time"
              tickFormatter={formatXAxis}
              interval="preserveStartEnd"
              minTickGap={50}
              padding={{ left: 0, right: 0 }}
            />
            <YAxis
              domain={yAxisDomain}
              allowDecimals={false}
            />
            <Tooltip content={renderTooltip} />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              name={`${logData[0]?.level === 'ERR' ? 'Error' : 'Warning'} Count`}
              stroke={theme.palette[logData[0]?.level === 'ERR' ? 'error' : 'warning'].main}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            {selectedError && (
              <Scatter
                data={scatterData}
                dataKey="count"
                name="Individual Occurrences"
                fill={theme.palette[logData[0]?.level === 'ERR' ? 'error' : 'warning'].main}
                shape="circle"
                legendType="circle"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Timeline; 