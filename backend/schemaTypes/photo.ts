// backend/schemaTypes/photo.ts
import { defineField, defineType } from 'sanity'

export const photoType = defineType({
  name: 'photo',
  title: 'Photography Collection',
  type: 'document',
  fields: [
    defineField({ 
      name: 'title', 
      title: 'Title', 
      type: 'string',
      validation: Rule => Rule.required() 
    }),
    
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          // Estas son EXACTAMENTE las categorías que me pediste
          { title: 'All', value: 'All' },
          { title: 'Beach', value: 'Beach' },
          { title: 'Street', value: 'Street' },
          { title: 'Plants', value: 'Plants' },
          { title: 'People', value: 'People' },
          { title: 'Animals', value: 'Animals' },
          { title: 'Food', value: 'Food' },
          { title: 'Abstract', value: 'Abstract' },
          { title: 'Sofia', value: 'Sofia' },
          { title: 'Sofia\'s Artwork', value: 'Sofia\'s Artwork' },
          { title: 'Art', value: 'Art' },
        ],
      },
      validation: Rule => Rule.required(),
    }),

    defineField({ 
      name: 'country', 
      title: 'Country Name', 
      type: 'string', 
      description: 'Escribe el nombre del país (ej: Japan, Peru...)' 
    }),
    
    // ESTE ES EL CAMPO MÁGICO PARA EL MAPA
    defineField({
      name: 'location',
      title: 'GPS Location',
      type: 'geopoint',
      description: 'Haz clic en el mapa para marcar dónde se tomó la foto',
    }),

    defineField({
      name: 'image',
      title: 'Photo File',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required(),
    }),
  ],
})