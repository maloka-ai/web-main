'use client';

import { Box, Divider, Typography } from '@mui/material';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import AlertasEAcoes from '../widgets/AlertasEAcoes';
import { useEffect, useState } from 'react';
import {
  analysisService,
  CockpitAlert,
  CustomerAnnualRecurrence,
  CustomerQuarterlyRecurrence,
  CustomerSegmentation,
} from '@/services/analysisService';
import {
  clientsMakeGraphs,
  salesMakeGraphs,
  stockMakeGraphs,
} from '../helpers/CockpitHelper';
import ResumeGraph from '../widgets/ResumeGraph';
import { GraphData } from '@/utils/graphics';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function CockpitPage() {
  const [customer, setCustomer] = useState<CustomerSegmentation[]>([]);
  const [customerQuarterlyRecurrence, setCustomerQuarterlyRecurrence] =
    useState<CustomerQuarterlyRecurrence[]>([]);
  const [customerAnnualRecurrence, setCustomerAnnualRecurrence] = useState<
    CustomerAnnualRecurrence[]
  >([]);
  const [annualRevenues, setAnnualRevenues] = useState<any[]>([]);
  const [monthlyRevenues, setMonthlyRevenues] = useState<any[]>([]);
  const [currentYearDailyRevenues, setCurrentYearDailyRevenues] = useState<
    any[]
  >([]);
  const [lastYearDailyRevenues, setLastYearDailyRevenues] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [cockpitAlert, setCockpitAlert] = useState<CockpitAlert[]>([]);
  const isMobile = useIsMobile();
  useEffect(() => {
    analysisService
      .getSegmentacaoClientes()
      .then(setCustomer)
      .catch(console.error);

    analysisService
      .getCustomerQuarterlyRecurrence(new Date().getFullYear() - 1)
      .then(setCustomerQuarterlyRecurrence)
      .catch(console.error);
    analysisService
      .getCustomerAnnualRecurrence(new Date().getFullYear() - 2)
      .then(setCustomerAnnualRecurrence)
      .catch(console.error);

    analysisService
      .getAnnualRevenues()
      .then(setAnnualRevenues)
      .catch(console.error);

    analysisService
      .getMonthlyRevenues()
      .then(setMonthlyRevenues)
      .catch(console.error);

    analysisService
      .getDailyRevenues(new Date().getFullYear(), new Date().getMonth() + 1)
      .then(setCurrentYearDailyRevenues)
      .catch(console.error);

    // analysisService.getDailyRevenues((new Date()).getFullYear() - 1, (new Date()).getMonth()) // TODO: Wait for API to populate last year data
    analysisService
      .getDailyRevenues(new Date().getFullYear(), new Date().getMonth())
      .then(setLastYearDailyRevenues)
      .catch(console.error);

    analysisService.getStockMetrics().then(setStock).catch(console.error);

    analysisService
      .getCockpitAlert()
      .then(setCockpitAlert)
      .catch(console.error);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '1.5rem',
        height: 'calc(100vh - 100px)',
        overflow: {
          xs: 'visible',
          md: 'hidden',
        },
        flexDirection: {
          xs: 'column',
          md: 'row',
        },
      }}
    >
      <Box
        sx={{
          width: {
            xs: '100%',
            md: '350px',
          },
          overflow: 'auto',
          pr: 1,
          pb: 16,
          minHeight: {
            xs: '50%',
            md: 'initial',
          },
          backgroundColor: {
            xs: '#f9f7f1',
            md: 'transparent',
          },
          borderRadius: {
            xs: '12px',
            md: '0px',
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} color="#4b4b4b" mb={1}>
          Alertas e Ações
        </Typography>
        {isMobile && <Divider />}
        <AlertasEAcoes cockpitAlert={cockpitAlert} />
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: {
            xs: 'visible',
            md: 'auto',
          },
          pr: 1,
          pb: 10,
        }}
      >
        <Typography variant="h6" fontWeight={600} color="#4b4b4b" mb={1.5}>
          Resultados • KPIs
        </Typography>

        <Box
          sx={{
            marginBottom: '2rem',
            // overflowY: 'auto',
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="#4b4b4b"
            mb={1}
            mt={2}
          >
            Vendas
          </Typography>
          {!annualRevenues &&
          !monthlyRevenues &&
          !currentYearDailyRevenues &&
          !lastYearDailyRevenues ? (
            <Box
              sx={{
                width: '100%',
                height: '250px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <InsightsOutlinedIcon
                sx={{
                  width: '100px',
                  height: 'auto',
                  color: '#e2c698',
                }}
              />
              <Typography color="#737064">Gerando análises...</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                padding: '4px',
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: {
                  xs: 'repeat(1, minmax(250px, 1fr))',
                  sm: 'repeat(2, minmax(250px, 1fr))',
                  md: 'repeat(3, minmax(250px, 1fr))',
                },
              }}
            >
              {annualRevenues &&
                monthlyRevenues &&
                salesMakeGraphs(
                  annualRevenues,
                  monthlyRevenues,
                  currentYearDailyRevenues,
                  lastYearDailyRevenues,
                ).map((graph, index) => (
                  <ResumeGraph
                    key={`sales-resume-graph-${index}`}
                    graph={{ ...graph, index } as GraphData}
                  />
                ))}
            </Box>
          )}

          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="#4b4b4b"
            mb={1}
            mt={2}
          >
            Estoque
          </Typography>
          {!stock ? (
            <Box
              sx={{
                width: '100%',
                height: '250px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <InsightsOutlinedIcon
                sx={{
                  width: '100px',
                  height: 'auto',
                  color: '#e2c698',
                }}
              />
              <Typography color="#737064">Gerando análises...</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                padding: '4px',
                display: 'grid',
                mb: 4,
                gap: '1rem',
                gridTemplateColumns: {
                  xs: 'repeat(1, minmax(250px, 1fr))',
                  sm: 'repeat(2, minmax(250px, 1fr))',
                  md: 'repeat(3, minmax(250px, 1fr))',
                },
              }}
            >
              {stock &&
                stockMakeGraphs(stock).map((graph, index) => (
                  <ResumeGraph
                    key={`stock-resume-graph-${index}`}
                    graph={{ ...graph, index } as GraphData}
                  />
                ))}
            </Box>
          )}

          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="#4b4b4b"
            mb={1}
          >
            Cliente
          </Typography>
          {!stock ? (
            <Box
              sx={{
                width: '100%',
                height: '250px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <InsightsOutlinedIcon
                sx={{
                  width: '100px',
                  height: 'auto',
                  color: '#e2c698',
                }}
              />
              <Typography color="#737064">Gerando análises...</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                padding: '4px',
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: {
                  xs: 'repeat(1, minmax(250px, 1fr))',
                  sm: 'repeat(2, minmax(250px, 1fr))',
                  md: 'repeat(3, minmax(250px, 1fr))',
                },
              }}
            >
              {customer &&
                customerQuarterlyRecurrence &&
                customerAnnualRecurrence &&
                clientsMakeGraphs(
                  customer,
                  customerQuarterlyRecurrence,
                  customerAnnualRecurrence,
                ).map((graph, index) => (
                  <ResumeGraph
                    key={`clients-resume-graph-${index}`}
                    graph={{ ...graph, index } as GraphData}
                  />
                ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
