import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Especialidade } from "./src/types/especialidade";
import { Paciente } from "./src/types/paciente";
import { Medico } from "./src/interfaces/medico";
import { Consulta } from "./src/interfaces/consulta";

const STORAGE_KEY = "@consultas:consulta_atual";

// Dados iniciais para exemplo
const cardiologia: Especialidade = {
  id: 1,
  nome: "Cardiologia",
  descricao: "Cuidados com o coração",
};

const medico1: Medico = {
  id: 1,
  nome: "Dr. Roberto Silva",
  crm: "CRM12345",
  especialidade: cardiologia,
  ativo: true,
};

const paciente1: Paciente = {
  id: 1,
  nome: "Carlos Andrade",
  cpf: "123.456.789-00",
  email: "carlos@email.com",
  telefone: "(11) 98765-4321",
};

const consultaInicial: Consulta = {
  id: 1,
  medico: medico1,
  paciente: paciente1,
  data: new Date(2026, 2, 10),
  valor: 350,
  status: "agendada",
  observacoes: "Consulta de rotina",
};

export default function App() {
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados ao iniciar
  useEffect(() => {
    carregarConsulta();
  }, []);

  // Persistir dados automaticamente quando a consulta mudar
  useEffect(() => {
    if (consulta) {
      salvarConsulta(consulta);
    }
  }, [consulta]);

  const carregarConsulta = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const dados = JSON.parse(jsonValue);
        // Converter string de data de volta para objeto Date
        dados.data = new Date(dados.data);
        setConsulta(dados);
      } else {
        setConsulta(consultaInicial);
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar os dados da consulta.");
      setConsulta(consultaInicial);
    } finally {
      setLoading(false);
    }
  };

  const salvarConsulta = async (valor: Consulta) => {
    try {
      const jsonValue = JSON.stringify(valor);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error("Erro ao salvar consulta:", e);
    }
  };

  const confirmarConsulta = () => {
    if (consulta) {
      setConsulta({
        ...consulta,
        status: "confirmada",
      });
      Alert.alert("Sucesso", "Consulta confirmada com sucesso!");
    }
  };

  const cancelarConsulta = () => {
    if (consulta) {
      setConsulta({
        ...consulta,
        status: "cancelada",
      });
      Alert.alert("Aviso", "Consulta cancelada.");
    }
  };

  const formatarValor = (valor: number): string => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarData = (data: Date): string => {
    return data.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!consulta) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Gerenciamento de Consulta</Text>

        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações do Paciente</Text>
            <Text style={styles.label}>Nome: <Text style={styles.value}>{consulta.paciente.nome}</Text></Text>
            <Text style={styles.label}>CPF: <Text style={styles.value}>{consulta.paciente.cpf}</Text></Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações do Médico</Text>
            <Text style={styles.label}>Médico: <Text style={styles.value}>{consulta.medico.nome}</Text></Text>
            <Text style={styles.label}>Especialidade: <Text style={styles.value}>{consulta.medico.especialidade.nome}</Text></Text>
            <Text style={styles.label}>CRM: <Text style={styles.value}>{consulta.medico.crm}</Text></Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes da Consulta</Text>
            <Text style={styles.label}>Data: <Text style={styles.value}>{formatarData(consulta.data)}</Text></Text>
            <Text style={styles.label}>Valor: <Text style={styles.value}>{formatarValor(consulta.valor)}</Text></Text>
            <View style={styles.statusContainer}>
              <Text style={styles.label}>Status: </Text>
              <View style={[styles.statusBadge, 
                consulta.status === 'confirmada' ? styles.statusConfirmada : 
                consulta.status === 'cancelada' ? styles.statusCancelada : styles.statusAgendada]}>
                <Text style={styles.statusText}>{consulta.status.toUpperCase()}</Text>
              </View>
            </View>
            {consulta.observacoes && (
              <Text style={styles.label}>Obs: <Text style={styles.value}>{consulta.observacoes}</Text></Text>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.confirmButton, consulta.status === 'confirmada' && styles.buttonDisabled]} 
            onPress={confirmarConsulta}
            disabled={consulta.status === 'confirmada'}
          >
            <Text style={styles.buttonText}>Confirmar Consulta</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.cancelButton, consulta.status === 'cancelada' && styles.buttonDisabled]} 
            onPress={cancelarConsulta}
            disabled={consulta.status === 'cancelada'}
          >
            <Text style={styles.buttonText}>Cancelar Consulta</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.footer}>Os dados são salvos automaticamente</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    padding: 20,
    alignItems: "stretch",
  },
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  value: {
    color: "#333",
    fontWeight: "normal",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusAgendada: {
    backgroundColor: "#FFE082",
  },
  statusConfirmada: {
    backgroundColor: "#C8E6C9",
  },
  statusCancelada: {
    backgroundColor: "#FFCDD2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    color: "#999",
    fontSize: 12,
  }
});
