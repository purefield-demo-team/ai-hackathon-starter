import {
  CLSReportCallback,
  FIDReportCallback,
  FCPReportCallback,
  LCPReportCallback,
  TTFBReportCallback,
} from 'web-vitals';

type PerformanceEntryHandler = CLSReportCallback | FIDReportCallback | FCPReportCallback | LCPReportCallback | TTFBReportCallback;

const reportWebVitals = (onPerfEntry: PerformanceEntryHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry as CLSReportCallback);
      getFID(onPerfEntry as FIDReportCallback);
      getFCP(onPerfEntry as FCPReportCallback);
      getLCP(onPerfEntry as LCPReportCallback);
      getTTFB(onPerfEntry as TTFBReportCallback);
    });
  }
};

export default reportWebVitals;
