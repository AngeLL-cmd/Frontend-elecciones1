import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LogOut, Users, TrendingUp, BarChart3, Database, Settings, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { dashboardApi, adminApi, DashboardStatsDTO } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStatsDTO>({
    totalVotes: 0,
    totalVoters: 0,
    participationRate: 0,
    presidentialVotes: 0,
    distritalVotes: 0,
    regionalVotes: 0,
    candidates: [],
  });
  const [cleaningLoading, setCleaningLoading] = useState<string | null>(null);
  const [trainingLoading, setTrainingLoading] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay token de admin
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      toast({
        title: "Acceso no autorizado",
        description: "Debes iniciar sesión para acceder al panel administrativo",
        variant: "destructive",
      });
      navigate("/admin");
      return;
    }

    // Cargar datos del dashboard
    loadDashboardData();
    
    // Recargar datos cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, [navigate, toast]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        toast({
          title: "Error al cargar datos",
          description: response.error || "No se pudieron cargar las estadísticas",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al conectar con el servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminEmail");
    navigate("/admin");
  };

  // Funciones de limpieza de datos
  const detectNullValues = async () => {
    setCleaningLoading("nulls");
    try {
      const response = await adminApi.deleteNullValues();
      if (response.success && response.data) {
        toast({
          title: "Valores nulos eliminados",
          description: `Se eliminaron ${response.data.deletedCount} registros con valores nulos`,
        });
        loadDashboardData(); // Refrescar datos
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al eliminar valores nulos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error eliminando valores nulos:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar valores nulos",
        variant: "destructive",
      });
    } finally {
      setCleaningLoading(null);
    }
  };

  const removeDuplicates = async () => {
    setCleaningLoading("duplicates");
    try {
      const response = await adminApi.deleteDuplicates();
      if (response.success && response.data) {
        toast({
          title: "Duplicados eliminados",
          description: `Se eliminaron ${response.data.deletedCount} votos duplicados`,
        });
        loadDashboardData(); // Refrescar datos
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al eliminar duplicados",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error eliminando duplicados:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar duplicados",
        variant: "destructive",
      });
    } finally {
      setCleaningLoading(null);
    }
  };

  const validateDNIs = async () => {
    setCleaningLoading("dnis");
    try {
      const response = await adminApi.validateDNIs();
      if (response.success && response.data) {
        if (response.data.count === 0) {
          toast({
            title: "Validación exitosa",
            description: "Todos los DNIs tienen el formato correcto",
          });
        } else {
          toast({
            title: "DNIs inválidos encontrados",
            description: `Se encontraron ${response.data.count} DNIs con formato inválido: ${response.data.invalidDNIs.slice(0, 3).join(", ")}${response.data.count > 3 ? "..." : ""}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al validar DNIs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error validando DNIs:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al validar DNIs",
        variant: "destructive",
      });
    } finally {
      setCleaningLoading(null);
    }
  };

  const normalizeData = async () => {
    setCleaningLoading("normalize");
    try {
      const response = await adminApi.normalizeData();
      if (response.success && response.data) {
        toast({
          title: "Datos normalizados",
          description: `Se normalizaron ${response.data.normalizedCount} registros`,
        });
        loadDashboardData(); // Refrescar datos
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al normalizar datos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error normalizando datos:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al normalizar datos",
        variant: "destructive",
      });
    } finally {
      setCleaningLoading(null);
    }
  };

  // Funciones de entrenamiento
  const startTraining = async (type: string) => {
    setTrainingLoading(type);
    try {
      // Simular proceso de entrenamiento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: `Entrenamiento de ${type} completado`,
        description: "El modelo ha sido entrenado exitosamente con los datos disponibles",
      });
    } catch (error) {
      console.error(`Error en entrenamiento de ${type}:`, error);
      toast({
        title: "Error",
        description: `Error al entrenar modelo de ${type}`,
        variant: "destructive",
      });
    } finally {
      setTrainingLoading(null);
    }
  };

  const candidatesData = (stats.candidates || [])
    .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

  const categoryData = [
    { name: "Presidencial", value: stats.presidentialVotes },
    { name: "Distrital", value: stats.distritalVotes },
    { name: "Regional", value: stats.regionalVotes },
  ];

  const COLORS = ["#D91E36", "#2E5C96", "#F39C12"];

  const topCandidates = candidatesData.slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-peru text-primary-foreground py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Panel Administrativo</h1>
              <p className="text-primary-foreground/90">Sistema Electoral Perú 2025</p>
            </div>
            <Button variant="secondary" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Análisis
            </TabsTrigger>
            <TabsTrigger value="cleaning" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Limpieza
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Entrenar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Cargando datos...</span>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardDescription>Total de Votantes</CardDescription>
                  <CardTitle className="text-3xl font-bold text-primary">
                    {stats.totalVoters.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Users className="w-8 h-8 text-primary/50" />
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardDescription>Total de Votos</CardDescription>
                  <CardTitle className="text-3xl font-bold text-secondary">
                    {stats.totalVotes.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendingUp className="w-8 h-8 text-secondary/50" />
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardDescription>Tasa de Participación</CardDescription>
                  <CardTitle className="text-3xl font-bold text-accent">
                    {stats.participationRate.toFixed(1)}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart3 className="w-8 h-8 text-accent/50" />
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardDescription>Candidatos</CardDescription>
                  <CardTitle className="text-3xl font-bold text-foreground">
                    {candidatesData.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Users className="w-8 h-8 text-muted-foreground/50" />
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Distribución de Votos por Categoría</CardTitle>
                  <CardDescription>Cantidad de votos en cada categoría electoral</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Top 10 Candidatos</CardTitle>
                  <CardDescription>Candidatos con más votos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCandidates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="voteCount" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Candidates Table */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Resultados por Candidato</CardTitle>
                <CardDescription>Detalle completo de votos por candidato</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">Candidato</th>
                        <th className="text-left py-3 px-4">Partido</th>
                        <th className="text-left py-3 px-4">Categoría</th>
                        <th className="text-right py-3 px-4">Votos</th>
                        <th className="text-right py-3 px-4">Porcentaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidatesData.map((candidate) => {
                        const categoryTotal = candidatesData
                          .filter((c) => c.category === candidate.category)
                          .reduce((sum, c) => sum + (c.voteCount || 0), 0);
                        const percentage = categoryTotal > 0 ? ((candidate.voteCount || 0) / categoryTotal) * 100 : 0;

                        return (
                          <tr key={candidate.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{candidate.name}</td>
                            <td className="py-3 px-4 text-muted-foreground">{candidate.partyName || "Sin partido"}</td>
                            <td className="py-3 px-4">
                              <span className="capitalize text-sm px-2 py-1 bg-primary/10 text-primary rounded">
                                {candidate.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold">{(candidate.voteCount || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-semibold text-primary">{percentage.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="cleaning">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Limpieza de Datos</CardTitle>
                <CardDescription>Herramientas para mantener la integridad de los datos electorales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col items-start gap-2"
                        disabled={cleaningLoading !== null}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold">Eliminar Valores Nulos</span>
                          {cleaningLoading === "nulls" && <Loader2 className="w-4 h-4 animate-spin" />}
                        </div>
                        <span className="text-sm text-muted-foreground">Eliminar registros con datos incompletos</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Valores Nulos</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción escaneará todas las tablas (candidatos, votantes, votos) en busca de registros con campos nulos o vacíos 
                          y los eliminará permanentemente. En la tabla de votos, se eliminarán los registros donde voter_dni, category o candidate_id sean nulos.
                          Esta operación no se puede deshacer. ¿Está seguro de continuar?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={detectNullValues} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Eliminar Valores Nulos
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col items-start gap-2"
                        disabled={cleaningLoading !== null}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold">Eliminar Duplicados</span>
                          {cleaningLoading === "duplicates" && <Loader2 className="w-4 h-4 animate-spin" />}
                        </div>
                        <span className="text-sm text-muted-foreground">Remover votos o votantes duplicados</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Duplicados</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción buscará y eliminará votos duplicados. Se mantendrán los votos más recientes. 
                          Esta operación no se puede deshacer. ¿Está seguro de continuar?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={removeDuplicates} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Eliminar Duplicados
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col items-start gap-2"
                        disabled={cleaningLoading !== null}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold">Validar DNIs</span>
                          {cleaningLoading === "dnis" && <Loader2 className="w-4 h-4 animate-spin" />}
                        </div>
                        <span className="text-sm text-muted-foreground">Verificar formato de documentos de identidad</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Validar DNIs</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción validará que todos los DNIs tengan el formato correcto (8 dígitos numéricos). 
                          No se modificarán los datos, solo se reportarán los DNIs inválidos encontrados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={validateDNIs}>
                          Validar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col items-start gap-2"
                        disabled={cleaningLoading !== null}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold">Normalizar Datos</span>
                          {cleaningLoading === "normalize" && <Loader2 className="w-4 h-4 animate-spin" />}
                        </div>
                        <span className="text-sm text-muted-foreground">Estandarizar formatos de direcciones y nombres</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Normalizar Datos</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción normalizará los nombres (capitalización adecuada), direcciones (eliminar espacios extras) 
                          y otros campos de texto en las tablas de votantes y candidatos. Los datos se actualizarán permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={normalizeData}>
                          Normalizar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Estas herramientas ayudan a mantener la calidad y consistencia de los datos del sistema electoral.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Entrenamiento de Modelos</CardTitle>
                <CardDescription>Configuración para análisis predictivo y machine learning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold mb-2">Predicción de Tendencias</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Entrenar modelos para predecir tendencias electorales basadas en datos históricos
                    </p>
                    <Button 
                      className="bg-gradient-peru hover:opacity-90" 
                      onClick={() => startTraining("Predicción de Tendencias")}
                      disabled={trainingLoading !== null}
                    >
                      {trainingLoading === "Predicción de Tendencias" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Entrenando...
                        </>
                      ) : (
                        "Iniciar Entrenamiento"
                      )}
                    </Button>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold mb-2">Detección de Anomalías</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Identificar patrones inusuales en el comportamiento de votación
                    </p>
                    <Button 
                      className="bg-gradient-peru hover:opacity-90" 
                      onClick={() => startTraining("Detección de Anomalías")}
                      disabled={trainingLoading !== null}
                    >
                      {trainingLoading === "Detección de Anomalías" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Configurando...
                        </>
                      ) : (
                        "Configurar Modelo"
                      )}
                    </Button>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold mb-2">Análisis de Participación</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Predecir tasas de participación por región y demografía
                    </p>
                    <Button 
                      className="bg-gradient-peru hover:opacity-90" 
                      onClick={() => startTraining("Análisis de Participación")}
                      disabled={trainingLoading !== null}
                    >
                      {trainingLoading === "Análisis de Participación" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Entrenando...
                        </>
                      ) : (
                        "Entrenar Predictor"
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Los modelos de machine learning se entrenarán utilizando los datos históricos disponibles en el sistema.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
