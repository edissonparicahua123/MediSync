import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { laboratoryAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

interface ResultFormProps {
    order: any
    onComplete: () => void
    onCancel: () => void
}

export default function ResultEntryForm({ order, onComplete, onCancel }: ResultFormProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploadingFile, setUploadingFile] = useState(false)
    const [results, setResults] = useState<any[]>([
        { name: '', value: '', unit: '', range: '', status: 'NORMAL' }
    ])

    const handleAddParam = () => {
        setResults([...results, { name: '', value: '', unit: '', range: '', status: 'NORMAL' }])
    }

    const handleRemoveParam = (index: number) => {
        setResults(results.filter((_, i) => i !== index))
    }

    const handleChange = (index: number, field: string, value: string) => {
        const newResults = [...results]
        newResults[index][field] = value
        setResults(newResults)
    }

    const handleSubmit = async () => {
        if (results.some(r => !r.name || !r.value)) {
            toast({ title: "Error", description: "Complete al menos el nombre y valor del parámetro", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            let fileUrl = ''
            if (file) {
                setUploadingFile(true)
                const uploadRes = await laboratoryAPI.uploadFile(file)
                fileUrl = uploadRes.data.url
                setUploadingFile(false)
            }

            await laboratoryAPI.updateStatus(order.id, 'COMPLETADO', {
                results,
                resultFile: fileUrl
            })

            toast({ title: "Éxito", description: "Resultados registrados correctamente" })
            onComplete()
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "No se pudieron guardar los resultados", variant: "destructive" })
        } finally {
            setLoading(false)
            setUploadingFile(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <h4 className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Detalle del Examen</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-zinc-500">Examen:</p>
                        <p className="font-bold text-zinc-200">{order.testName}</p>
                    </div>
                    <div>
                        <p className="text-zinc-500">Paciente:</p>
                        <p className="font-bold text-zinc-200">{order.patient?.firstName} {order.patient?.lastName}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-zinc-300">Parámetros Clínicos</h4>
                    <Button variant="outline" size="sm" onClick={handleAddParam} className="h-8 border-zinc-800 bg-zinc-900">
                        <Plus className="h-3 w-3 mr-1" /> Agregar Parámetro
                    </Button>
                </div>

                {results.map((res, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end bg-zinc-900/30 p-3 rounded-md border border-zinc-800/50">
                        <div className="col-span-4 space-y-1">
                            <Label className="text-[10px] uppercase text-zinc-500">Parámetro</Label>
                            <Input
                                placeholder="Ej: Glucosa"
                                value={res.name}
                                onChange={(e) => handleChange(index, 'name', e.target.value)}
                                className="h-8 bg-zinc-950 border-zinc-800"
                            />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label className="text-[10px] uppercase text-zinc-500">Valor</Label>
                            <Input
                                placeholder="0.0"
                                value={res.value}
                                onChange={(e) => handleChange(index, 'value', e.target.value)}
                                className="h-8 bg-zinc-950 border-zinc-800"
                            />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label className="text-[10px] uppercase text-zinc-500">Unidad</Label>
                            <Input
                                placeholder="mg/dL"
                                value={res.unit}
                                onChange={(e) => handleChange(index, 'unit', e.target.value)}
                                className="h-8 bg-zinc-950 border-zinc-800"
                            />
                        </div>
                        <div className="col-span-3 space-y-1">
                            <Label className="text-[10px] uppercase text-zinc-500">Rango Ref.</Label>
                            <Input
                                placeholder="70 - 110"
                                value={res.range}
                                onChange={(e) => handleChange(index, 'range', e.target.value)}
                                className="h-8 bg-zinc-950 border-zinc-800"
                            />
                        </div>
                        <div className="col-span-1 flex justify-end pb-1">
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveParam(index)} className="h-8 w-8 p-0 text-zinc-500 hover:text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-zinc-300">Documento Adjunto (Opcional)</h4>
                <div className="border-2 border-dashed border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}>
                    <input type="file" id="file-upload" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFile(e.target.files?.[0] || null)} />

                    {file ? (
                        <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="h-6 w-6" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-zinc-500 h-6">Cambiar</Button>
                        </div>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-zinc-600 mb-2" />
                            <p className="text-sm text-zinc-400 font-medium">Click para subir reporte PDF o Imagen</p>
                            <p className="text-xs text-zinc-500 mt-1">Máximo 10MB</p>
                        </>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button variant="ghost" onClick={onCancel} disabled={loading} className="text-zinc-400">
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]">
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {uploadingFile ? 'Subiendo...' : 'Guardando...'}
                        </>
                    ) : 'Finalizar Orden'}
                </Button>
            </div>
        </div>
    )
}
