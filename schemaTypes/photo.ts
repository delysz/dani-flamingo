// schemaTypes/photo.ts
import { defineField, defineType } from 'sanity'

export const photoType = defineType({
  name: 'photo',
  title: 'Galería de Fotos',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título de la foto',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Archivo de Imagen',
      type: 'image',
      options: {
        hotspot: true, // Esto te permite elegir el centro de la foto para recortes automáticos
      },
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          { title: 'Paisajes', value: 'paisajes' },
          { title: 'Retratos', value: 'retratos' },
          { title: 'Eventos', value: 'eventos' },
        ],
      },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Fecha de publicación',
      type: 'datetime',
    }),
  ],
})