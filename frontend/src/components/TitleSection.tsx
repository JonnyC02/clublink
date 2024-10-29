interface TitleSectionProps {
    title: string,
    subtitle: string,
    cta?: React.ReactNode
}

const TitleSection: React.FC<TitleSectionProps> = ({ title = "Hero Section", subtitle = "", cta }) => {
    return (
        <section className='bg-blue-50 py-20'>
            <div className='container mx-auto text-center'>
                <h1 className='text-4xl font-bold text-gray-800'>{title}</h1>
                <p className='mt-4 text-gray-600'>{subtitle}</p>
                <div className="mt-8 flex justify-center space-x-4">
                    {cta}
                </div>
            </div>
        </section>
    )
}

export default TitleSection;