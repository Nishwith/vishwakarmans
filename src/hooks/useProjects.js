import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDesigner,
  getDesignersList,
  getProjectsByDesigner,
  getReviewsByDesigner,
  getConnection,
  getMarketplaceFeed,
  createReview,
} from '../services/projectService';

/** Single designer by id. */
export const useDesigner = (designerId) =>
  useQuery({
    queryKey: ['designers', designerId],
    queryFn: () => getDesigner(designerId),
    enabled: !!designerId,
  });

/** All approved designers (directory page). */
export const useDesignersList = () =>
  useQuery({
    queryKey: ['designers', 'list'],
    queryFn: getDesignersList,
    staleTime: 60 * 1000,
  });

/** Projects for a given designer, with images. */
export const useProjectsByDesigner = (designerId) =>
  useQuery({
    queryKey: ['projects', 'byDesigner', designerId],
    queryFn: () => getProjectsByDesigner(designerId),
    enabled: !!designerId,
  });

/** Reviews for a given designer. */
export const useReviewsByDesigner = (designerId) =>
  useQuery({
    queryKey: ['reviews', designerId],
    queryFn: () => getReviewsByDesigner(designerId),
    enabled: !!designerId,
  });

/** Connection status between client and designer. */
export const useConnection = (clientId, designerId) =>
  useQuery({
    queryKey: ['connections', clientId, designerId],
    queryFn: () => getConnection(clientId, designerId),
    enabled: !!(clientId && designerId),
  });

/** Materialized view marketplace feed. */
export const useMarketplaceFeed = () =>
  useQuery({
    queryKey: ['marketplace', 'feed'],
    queryFn: getMarketplaceFeed,
    staleTime: 60 * 1000,
  });

/** Submit a review (mutation). Auto-invalidates reviews and designer cache. */
export const useCreateReview = (designerId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', designerId] });
      qc.invalidateQueries({ queryKey: ['designers', designerId] });
    },
  });
};
