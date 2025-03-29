import React from 'react';
import {
  Box,
  Typography,
  Paper,
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
import { format, startOfDay, endOfDay, subDays, addMinutes, isWithinInterval } from 'date-fns';

interface LogData {
  timestamp: Date;
  error: string;
  file: string;
}

interface TimelineProps {
  logData: LogData[];
  selectedError: string | null;
}

interface ChartDataPoint {
  timestamp: Date;
  count: number;
  errors?: LogData[];
}

interface ScatterDataPoint extends ChartDataPoint {
  file: string;
  intervalCount: number;
}

const Timeline: React.FC<TimelineProps> = ({ logData, selectedError }) => {
  const theme = useTheme();

  // Process data for the chart
  const chartData = React.useMemo(() => {
    if (!logData.length) return [];

    // Filter data if an error is selected
    const filteredData = selectedError
      ? logData.filter(log => log.error === selectedError)
      : logData;

    // Get the date range (last 25 days)
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, 24));

    // Create 30-minute intervals
    const intervals: ChartDataPoint[] = [];
    let currentInterval = startDate;

    while (currentInterval <= endDate) {
      intervals.push({
        timestamp: new Date(currentInterval),
        count: 0,
        errors: []
      });
      currentInterval = addMinutes(currentInterval, 30);
    }

    // Count occurrences and collect errors for each interval
    filteredData.forEach(log => {
      const interval = intervals.find(i => 
        isWithinInterval(log.timestamp, {
          start: i.timestamp,
          end: addMinutes(i.timestamp, 30)
        })
      );
      if (interval) {
        interval.count++;
        interval.errors?.push(log);
      }
    });

    return intervals;
  }, [logData, selectedError]);

  const formatXAxis = (date: Date) => {
    return format(date, 'MMM d');
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
            {data.errors && data.errors.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Errors in this interval:
                </Typography>
                {data.errors.map((error: LogData, index: number) => (
                  <Typography key={index} variant="caption" display="block">
                    {format(error.timestamp, 'HH:mm:ss')} - {error.file}
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
  const scatterData = React.useMemo(() => {
    if (!selectedError) return [];
    
    return chartData.flatMap(interval => 
      (interval.errors || []).map(error => ({
        timestamp: error.timestamp,
        count: interval.count,
        intervalCount: interval.count,
        file: error.file
      }))
    );
  }, [chartData, selectedError]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Error Timeline (Last 30 Days)
      </Typography>
      
      <Box sx={{ height: 400, width: '100%' }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 16,
              right: 16,
              bottom: 0,
              left: 24,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              interval="preserveStartEnd"
              minTickGap={100}
            />
            <YAxis />
            <Tooltip content={renderTooltip} />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              name="Error Count"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={false}
            />
            {selectedError && (
              <Scatter
                data={scatterData}
                dataKey="count"
                name="Individual Errors"
                fill={theme.palette.secondary.main}
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