import { useParams } from 'react-router-dom'
import { MediaDetails } from './MediaDetails'

export function DetailsPage() {
    const { type, id } = useParams<{ type: string; id: string }>()

    if (!type || !id) return null

    return <MediaDetails type={type} id={id} />
}
